"""
Painted Cartoon Earth — Interactive Portfolio Scene (smooth-texture version)
Blender 4.x / 5.x | Cycles | glTF-ready

Uses two generated textures (equirectangular, 2048x1024):
  earth_cartoon_diffuse.png    - painted land & water (Base Color)
  earth_cartoon_roughness.png  - glossy water / matte land (Roughness)

Hierarchy:
  Earth_Root
    ├── Planet        (smooth UV sphere, textured)
    ├── Clouds        (soft puff clusters)
    ├── Atmosphere    (fresnel rim shell — rebuild as shader in Three.js)
    ├── Trees         (optional, sparse, placed on real land)
    └── POI_Group
          ├── POI_01_London ...

Run from the Scripting tab. Set the three file paths below first.
"""

import bpy
import bmesh
import math
import random
import numpy as np
from pathlib import Path
from math import radians, sin, cos, pi
from mathutils import Vector, Matrix

# ----------------------------------------------------------------------------
# CONFIG
# ----------------------------------------------------------------------------

QUALITY = "HQ"          # "HQ" = cinematic render | "RT" = web/glTF realtime
SEED = 42


def find_repo_root():
    candidates = []

    if "__file__" in globals():
        candidates.append(Path(__file__).resolve().parents[1])

    if bpy.data.filepath:
        blend_dir = Path(bpy.data.filepath).resolve().parent
        candidates.extend([blend_dir, blend_dir.parent])

    candidates.append(Path.cwd())

    for candidate in candidates:
        if (candidate / "package.json").exists() and (candidate / "public").exists():
            return candidate

    return candidates[0]


REPO_ROOT = find_repo_root()
MODELS_DIR = REPO_ROOT / "public" / "models"
WEB_EXPORT_SKIP_OBJECTS = {"Atmosphere", "POI_Group"}

TEX_DIFFUSE = str(MODELS_DIR / "earth_cartoon_diffuse.png")
TEX_ROUGHNESS = str(MODELS_DIR / "earth_cartoon_roughness.png")
EARTH_MAP_PATH = str(MODELS_DIR / "2k_earth_specular_map.tif")   # only used to place trees on land

EXPORT_ON_RUN = True
EXPORT_GLB_PATH = str(MODELS_DIR / "earth-portfolio.glb")

PLANET_RADIUS = 2.0

# Smooth continent relief: how far land rises above the ocean, as a fraction
# of the planet radius. 0.0 = perfectly smooth ball, 0.04-0.06 = toy-globe
# plateaus like the reference. The slopes are rounded, never faceted.
RELIEF = 0
RELIEF_SLOPE_PX = 10     # coast incline width in map pixels (~1.8 deg each)

CFG = {
    "HQ": dict(
        sphere_segments=128, sphere_rings=64,    # ~16k tris, perfectly smooth
        cloud_clusters=18,
        trees=60,            # set 0 for a clean painted globe
        samples=1024,
        use_volume_fog=True,
        res=(1920, 1080),
    ),
    "RT": dict(
        sphere_segments=64, sphere_rings=32,     # ~4k tris
        cloud_clusters=10,
        trees=24,
        samples=128,
        use_volume_fog=False,
        res=(1280, 720),
    ),
}[QUALITY]

POIS = [
    ("London",    51.5,   -0.12),
    ("Lusaka",   -15.4,    28.3),
    ("NewYork",   40.7,   -74.0),
    ("Tokyo",     35.7,   139.7),
    ("Sydney",   -33.9,   151.2),
]

COL_TRUNK = (0.310, 0.200, 0.120, 1.0)
COL_FOLIAGE = (0.244, 0.541, 0.306, 1.0)
COL_POI = (1.000, 0.520, 0.180, 1.0)

random.seed(SEED)

# ----------------------------------------------------------------------------
# HELPERS
# ----------------------------------------------------------------------------

def clean_scene():
    bpy.ops.object.select_all(action="SELECT")
    bpy.ops.object.delete()
    for coll in list(bpy.data.collections):
        if coll.name.startswith("Earth"):
            bpy.data.collections.remove(coll)
    for block_list in (bpy.data.meshes, bpy.data.materials,
                       bpy.data.lights, bpy.data.cameras, bpy.data.worlds):
        for block in list(block_list):
            if block.users == 0:
                block_list.remove(block)


def make_material(name, color, roughness=0.7, emission=0.0):
    mat = bpy.data.materials.new(name)
    mat.use_nodes = True
    bsdf = mat.node_tree.nodes["Principled BSDF"]
    bsdf.inputs["Base Color"].default_value = color
    bsdf.inputs["Roughness"].default_value = roughness
    if emission > 0.0:
        bsdf.inputs["Emission Color"].default_value = color
        bsdf.inputs["Emission Strength"].default_value = emission
    return mat


def link_to_collection(obj, collection):
    for c in obj.users_collection:
        c.objects.unlink(obj)
    collection.objects.link(obj)


def merge_template(master_bm, template_mesh, matrix):
    v_before = len(master_bm.verts)
    master_bm.from_mesh(template_mesh)
    master_bm.verts.ensure_lookup_table()
    for v in master_bm.verts[v_before:]:
        v.co = matrix @ v.co


def latlon_to_dir(lat_deg, lon_deg):
    lat, lon = radians(lat_deg), radians(lon_deg)
    return Vector((cos(lat) * cos(lon), cos(lat) * sin(lon), sin(lat)))


# --- land lookup (trees only) -------------------------------------------------

_MAP = None
_RELIEF_GRID = None

def _box_blur(a, r):
    """Separable box blur; wraps horizontally (the +-180 seam), clamps at poles."""
    h, w = a.shape
    pad = np.concatenate([a[:, -r:], a, a[:, :r]], axis=1)
    cs = np.cumsum(pad, axis=1, dtype=np.float64)
    cs = np.concatenate([np.zeros((h, 1)), cs], axis=1)
    a = ((cs[:, 2 * r + 1:] - cs[:, :w]) / (2 * r + 1)).astype(np.float32)
    pad = np.concatenate([np.repeat(a[:1], r, 0), a, np.repeat(a[-1:], r, 0)], axis=0)
    cs = np.cumsum(pad, axis=0, dtype=np.float64)
    cs = np.concatenate([np.zeros((1, w)), cs], axis=0)
    return ((cs[2 * r + 1:, :] - cs[:h, :]) / (2 * r + 1)).astype(np.float32)


def load_earth_map():
    global _MAP, _RELIEF_GRID
    try:
        img = bpy.data.images.load(bpy.path.abspath(EARTH_MAP_PATH),
                                   check_existing=True)
    except RuntimeError:
        print(f"NOTE: {EARTH_MAP_PATH} not found — trees and relief skipped.")
        return
    w, h = img.size
    ch = img.channels
    px = [0.0] * (w * h * ch)
    img.pixels.foreach_get(px)
    _MAP = (px, w, h, ch)
    if RELIEF > 0.0:
        red = np.array(px, dtype=np.float32).reshape(h, w, ch)[:, :, 0]
        land01 = (red < 0.5).astype(np.float32)       # ocean is white
        g = land01
        for _ in range(3):                            # 3 box passes ~ gaussian
            g = _box_blur(g, RELIEF_SLOPE_PX)
        _RELIEF_GRID = g                              # row 0 = south (Blender)
        print(f"Relief height field built ({w}x{h})")


def relief_height(direction):
    """0 over ocean -> 1 on the continental plateau, with smooth coast slopes."""
    if _RELIEF_GRID is None:
        return 0.0
    h, w = _RELIEF_GRID.shape
    lon = math.atan2(direction.y, direction.x)
    lat = math.asin(max(-1.0, min(1.0, direction.z)))
    x = ((0.5 + lon / (2.0 * pi)) % 1.0) * (w - 1)
    y = min(max((0.5 + lat / pi), 0.0), 1.0) * (h - 1)
    x0, y0 = int(x), int(y)
    x1, y1 = min(x0 + 1, w - 1), min(y0 + 1, h - 1)
    fx, fy = x - x0, y - y0
    m = (_RELIEF_GRID[y0, x0] * (1 - fx) * (1 - fy) +
         _RELIEF_GRID[y0, x1] * fx * (1 - fy) +
         _RELIEF_GRID[y1, x0] * (1 - fx) * fy +
         _RELIEF_GRID[y1, x1] * fx * fy)
    t = min(1.0, max(0.0, (m - 0.15) / 0.7))          # keep ocean perfectly flat
    return t * t * (3.0 - 2.0 * t)                    # smoothstep


def surface_radius(direction):
    return PLANET_RADIUS * (1.0 + RELIEF * relief_height(direction))


def is_land(direction):
    if _MAP is None:
        return False
    px, w, h, ch = _MAP
    lon = math.atan2(direction.y, direction.x)
    lat = math.asin(max(-1.0, min(1.0, direction.z)))
    u = 0.5 + lon / (2.0 * pi)
    v = 0.5 + lat / pi
    x = int((u % 1.0) * (w - 1))
    y = int(min(max(v, 0.0), 1.0) * (h - 1))
    return px[(y * w + x) * ch] < 0.5        # specular map: ocean is white


# ----------------------------------------------------------------------------
# SCENE BUILD
# ----------------------------------------------------------------------------

clean_scene()
scene = bpy.context.scene
load_earth_map()

earth_col = bpy.data.collections.new("Earth")
scene.collection.children.link(earth_col)

root = bpy.data.objects.new("Earth_Root", None)
root.empty_display_size = 0.3
earth_col.objects.link(root)

# --- Planet: smooth textured sphere -------------------------------------------

bpy.ops.mesh.primitive_uv_sphere_add(
    segments=CFG["sphere_segments"], ring_count=CFG["sphere_rings"],
    radius=PLANET_RADIUS)
planet = bpy.context.active_object
planet.name = "Planet"
mesh = planet.data
mesh.name = "Planet"
bpy.ops.object.shade_smooth()

# raise the continents as smooth rounded plateaus
if RELIEF > 0.0 and _RELIEF_GRID is not None:
    for v in mesh.vertices:
        d = v.co.normalized()
        v.co = d * surface_radius(d)

# Rebuild UVs from vertex directions so the equirectangular textures and the
# POI lat/lon convention line up exactly (u=0.5 at lon 0, v=0.5 at the equator)
if not mesh.uv_layers:
    mesh.uv_layers.new(name="UVMap")
uv_layer = mesh.uv_layers[0]
for poly in mesh.polygons:
    coords = []
    for li in poly.loop_indices:
        d = mesh.vertices[mesh.loops[li].vertex_index].co.normalized()
        u = 0.5 + math.atan2(d.y, d.x) / (2.0 * pi)
        v = 0.5 + math.asin(max(-1.0, min(1.0, d.z))) / pi
        coords.append([li, u, v])
    # fix faces that straddle the +-180 seam
    us = [c[1] for c in coords]
    if max(us) - min(us) > 0.5:
        for c in coords:
            if c[1] < 0.5:
                c[1] += 1.0
    for li, u, v in coords:
        uv_layer.data[li].uv = (u, v)

# textured material
m_planet = bpy.data.materials.new("M_Planet")
m_planet.use_nodes = True
nt = m_planet.node_tree
bsdf = nt.nodes["Principled BSDF"]

tex_d = nt.nodes.new("ShaderNodeTexImage")
tex_d.image = bpy.data.images.load(bpy.path.abspath(TEX_DIFFUSE),
                                   check_existing=True)
nt.links.new(tex_d.outputs["Color"], bsdf.inputs["Base Color"])

try:
    tex_r = nt.nodes.new("ShaderNodeTexImage")
    tex_r.image = bpy.data.images.load(bpy.path.abspath(TEX_ROUGHNESS),
                                       check_existing=True)
    tex_r.image.colorspace_settings.name = "Non-Color"
    nt.links.new(tex_r.outputs["Color"], bsdf.inputs["Roughness"])
except RuntimeError:
    bsdf.inputs["Roughness"].default_value = 0.6
    print(f"NOTE: {TEX_ROUGHNESS} not found — using flat roughness.")

mesh.materials.append(m_planet)
planet.parent = root
link_to_collection(planet, earth_col)

# --- Clouds --------------------------------------------------------------------

cloud_bm = bmesh.new()
puff_tmpl = bpy.data.meshes.new("_puff_tmpl")
tmp_bm = bmesh.new()
bmesh.ops.create_uvsphere(tmp_bm, u_segments=12, v_segments=8, radius=1.0)
for f in tmp_bm.faces:
    f.smooth = True
tmp_bm.to_mesh(puff_tmpl)
tmp_bm.free()

cloud_alt = PLANET_RADIUS * 1.12
for _ in range(CFG["cloud_clusters"]):
    d = Vector((random.gauss(0, 1), random.gauss(0, 1),
                random.gauss(0, 1))).normalized()
    center = d * cloud_alt
    rot = d.to_track_quat("Z", "Y").to_matrix().to_4x4()
    for _ in range(random.randint(3, 6)):
        local = Vector((random.uniform(-0.16, 0.16),
                        random.uniform(-0.10, 0.10),
                        random.uniform(-0.02, 0.02)))
        s = random.uniform(0.05, 0.11)
        scale = Matrix.Diagonal((s, s * 0.8, s * 0.5, 1.0))
        mat = Matrix.Translation(center) @ rot @ Matrix.Translation(local) @ scale
        merge_template(cloud_bm, puff_tmpl, mat)

clouds_mesh = bpy.data.meshes.new("Clouds")
cloud_bm.to_mesh(clouds_mesh)
cloud_bm.free()
bpy.data.meshes.remove(puff_tmpl)
clouds = bpy.data.objects.new("Clouds", clouds_mesh)
clouds_mesh.materials.append(
    make_material("M_Cloud", (0.95, 0.97, 1.0, 1.0), roughness=0.95,
                  emission=0.05))
clouds.parent = root
earth_col.objects.link(clouds)

# --- Atmosphere shell ------------------------------------------------------------
# Renders in Cycles; strip it for the web build and use a fresnel shader in R3F.

bpy.ops.mesh.primitive_uv_sphere_add(
    segments=48, ring_count=24, radius=PLANET_RADIUS * 1.08)
atmo = bpy.context.active_object
atmo.name = "Atmosphere"
atmo.data.name = "Atmosphere"
bpy.ops.object.shade_smooth()

m_atmo = bpy.data.materials.new("M_Atmosphere")
m_atmo.use_nodes = True
nt = m_atmo.node_tree
nt.nodes.clear()
out = nt.nodes.new("ShaderNodeOutputMaterial")
mix = nt.nodes.new("ShaderNodeMixShader")
transp = nt.nodes.new("ShaderNodeBsdfTransparent")
emit = nt.nodes.new("ShaderNodeEmission")
layerw = nt.nodes.new("ShaderNodeLayerWeight")
ramp = nt.nodes.new("ShaderNodeValToRGB")
emit.inputs["Color"].default_value = (0.35, 0.62, 1.0, 1.0)
emit.inputs["Strength"].default_value = 2.0
layerw.inputs["Blend"].default_value = 0.25
ramp.color_ramp.elements[0].position = 0.55
ramp.color_ramp.elements[1].position = 1.0
nt.links.new(layerw.outputs["Facing"], ramp.inputs["Fac"])
nt.links.new(ramp.outputs["Color"], mix.inputs["Fac"])
nt.links.new(transp.outputs["BSDF"], mix.inputs[1])
nt.links.new(emit.outputs["Emission"], mix.inputs[2])
nt.links.new(mix.outputs["Shader"], out.inputs["Surface"])
try:
    m_atmo.blend_method = "BLEND"
except AttributeError:
    pass
atmo.data.materials.append(m_atmo)
atmo.parent = root
link_to_collection(atmo, earth_col)

# --- Trees (sparse, on real land) -----------------------------------------------

if CFG["trees"] > 0 and _MAP is not None:
    tree_tmpl = bpy.data.meshes.new("_tree_tmpl")
    tbm = bmesh.new()
    bmesh.ops.create_cone(tbm, cap_ends=True, segments=8,
                          radius1=0.015, radius2=0.012, depth=0.05,
                          matrix=Matrix.Translation((0, 0, 0.025)))
    f1 = bmesh.ops.create_cone(tbm, cap_ends=True, segments=8,
                               radius1=0.05, radius2=0.0, depth=0.12,
                               matrix=Matrix.Translation((0, 0, 0.10)))
    f2 = bmesh.ops.create_cone(tbm, cap_ends=True, segments=8,
                               radius1=0.034, radius2=0.0, depth=0.08,
                               matrix=Matrix.Translation((0, 0, 0.17)))
    fol = set(v.index for v in f1["verts"]) | set(v.index for v in f2["verts"])
    tbm.verts.ensure_lookup_table()
    for f in tbm.faces:
        f.material_index = 1 if all(v.index in fol for v in f.verts) else 0
        f.smooth = True
    tbm.to_mesh(tree_tmpl)
    tbm.free()

    tree_bm = bmesh.new()
    placed, attempts = 0, 0
    while placed < CFG["trees"] and attempts < CFG["trees"] * 60:
        attempts += 1
        d = Vector((random.gauss(0, 1), random.gauss(0, 1),
                    random.gauss(0, 1))).normalized()
        if abs(d.z) > 0.85 or not is_land(d):      # skip poles and oceans
            continue
        rot = d.to_track_quat("Z", "Y").to_matrix().to_4x4()
        spin = Matrix.Rotation(random.uniform(0, 2 * pi), 4, "Z")
        s = random.uniform(0.8, 1.3)
        mat = (Matrix.Translation(d * surface_radius(d)) @ rot @ spin @
               Matrix.Diagonal((s, s, s, 1.0)))
        merge_template(tree_bm, tree_tmpl, mat)
        placed += 1

    trees_mesh = bpy.data.meshes.new("Trees")
    tree_bm.to_mesh(trees_mesh)
    tree_bm.free()
    bpy.data.meshes.remove(tree_tmpl)
    trees = bpy.data.objects.new("Trees", trees_mesh)
    trees_mesh.materials.append(make_material("M_TreeTrunk", COL_TRUNK, 0.9))
    trees_mesh.materials.append(make_material("M_TreeFoliage", COL_FOLIAGE, 0.85))
    trees.parent = root
    earth_col.objects.link(trees)
    print(f"Trees placed: {placed}")

# --- Points of Interest -----------------------------------------------------------

poi_group = bpy.data.objects.new("POI_Group", None)
poi_group.parent = root
earth_col.objects.link(poi_group)

pin_mesh = bpy.data.meshes.new("POI_Pin")
pbm = bmesh.new()
bmesh.ops.create_cone(pbm, cap_ends=True, segments=10,
                      radius1=0.0, radius2=0.045, depth=0.16,
                      matrix=Matrix.Translation((0, 0, 0.08)))
bmesh.ops.create_uvsphere(pbm, u_segments=12, v_segments=10, radius=0.05,
                          matrix=Matrix.Translation((0, 0, 0.19)))
for f in pbm.faces:
    f.smooth = True
pbm.to_mesh(pin_mesh)
pbm.free()
pin_mesh.materials.append(
    make_material("M_POI", COL_POI, roughness=0.4, emission=2.5))

for i, (name, lat, lon) in enumerate(POIS, start=1):
    d = latlon_to_dir(lat, lon)
    pin = bpy.data.objects.new(f"POI_{i:02d}_{name}", pin_mesh)
    pin.location = d * (surface_radius(d) + 0.01)
    pin.rotation_mode = "QUATERNION"
    pin.rotation_quaternion = d.to_track_quat("Z", "Y")
    pin.parent = poi_group
    earth_col.objects.link(pin)

# ----------------------------------------------------------------------------
# WORLD — procedural deep-space nebula + starfield (render-only)
# ----------------------------------------------------------------------------

world = bpy.data.worlds.new("Space")
scene.world = world
world.use_nodes = True
wn = world.node_tree
wn.nodes.clear()

w_out = wn.nodes.new("ShaderNodeOutputWorld")
bg = wn.nodes.new("ShaderNodeBackground")
texco = wn.nodes.new("ShaderNodeTexCoord")
mapping = wn.nodes.new("ShaderNodeMapping")

neb_noise = wn.nodes.new("ShaderNodeTexNoise")
neb_noise.inputs["Scale"].default_value = 1.7
neb_noise.inputs["Detail"].default_value = 9.0
neb_noise.inputs["Roughness"].default_value = 0.62
neb_ramp = wn.nodes.new("ShaderNodeValToRGB")
cr = neb_ramp.color_ramp
cr.elements[0].position = 0.30
cr.elements[0].color = (0.004, 0.006, 0.015, 1.0)
cr.elements[1].position = 0.62
cr.elements[1].color = (0.020, 0.060, 0.110, 1.0)
e_teal = cr.elements.new(0.74); e_teal.color = (0.015, 0.110, 0.130, 1.0)
e_violet = cr.elements.new(0.86); e_violet.color = (0.080, 0.040, 0.140, 1.0)
e_gold = cr.elements.new(0.97); e_gold.color = (0.220, 0.150, 0.060, 1.0)

star_noise = wn.nodes.new("ShaderNodeTexNoise")
star_noise.inputs["Scale"].default_value = 750.0
star_noise.inputs["Detail"].default_value = 2.0
star_clip = wn.nodes.new("ShaderNodeMapRange")
star_clip.inputs["From Min"].default_value = 0.78
star_clip.inputs["From Max"].default_value = 0.80
star_clip.clamp = True
star_gain = wn.nodes.new("ShaderNodeMath")
star_gain.operation = "MULTIPLY"
star_gain.inputs[1].default_value = 22.0

star2 = wn.nodes.new("ShaderNodeTexNoise")
star2.inputs["Scale"].default_value = 180.0
star2_clip = wn.nodes.new("ShaderNodeMapRange")
star2_clip.inputs["From Min"].default_value = 0.835
star2_clip.inputs["From Max"].default_value = 0.85
star2_clip.clamp = True
star2_gain = wn.nodes.new("ShaderNodeMath")
star2_gain.operation = "MULTIPLY"
star2_gain.inputs[1].default_value = 60.0

add_stars = wn.nodes.new("ShaderNodeMath"); add_stars.operation = "ADD"
combine = wn.nodes.new("ShaderNodeMixRGB")
combine.blend_type = "ADD"
combine.inputs["Fac"].default_value = 1.0

wn.links.new(texco.outputs["Generated"], mapping.inputs["Vector"])
wn.links.new(mapping.outputs["Vector"], neb_noise.inputs["Vector"])
wn.links.new(mapping.outputs["Vector"], star_noise.inputs["Vector"])
wn.links.new(mapping.outputs["Vector"], star2.inputs["Vector"])
wn.links.new(neb_noise.outputs["Fac"], neb_ramp.inputs["Fac"])
wn.links.new(star_noise.outputs["Fac"], star_clip.inputs["Value"])
wn.links.new(star_clip.outputs["Result"], star_gain.inputs[0])
wn.links.new(star2.outputs["Fac"], star2_clip.inputs["Value"])
wn.links.new(star2_clip.outputs["Result"], star2_gain.inputs[0])
wn.links.new(star_gain.outputs["Value"], add_stars.inputs[0])
wn.links.new(star2_gain.outputs["Value"], add_stars.inputs[1])
wn.links.new(neb_ramp.outputs["Color"], combine.inputs["Color1"])
wn.links.new(add_stars.outputs["Value"], combine.inputs["Color2"])
wn.links.new(combine.outputs["Color"], bg.inputs["Color"])
bg.inputs["Strength"].default_value = 1.0
wn.links.new(bg.outputs["Background"], w_out.inputs["Surface"])

if CFG["use_volume_fog"]:
    vol = wn.nodes.new("ShaderNodeVolumeScatter")
    vol.inputs["Density"].default_value = 0.002
    vol.inputs["Anisotropy"].default_value = 0.35
    vol.inputs["Color"].default_value = (0.45, 0.62, 0.85, 1.0)
    wn.links.new(vol.outputs["Volume"], w_out.inputs["Volume"])

# ----------------------------------------------------------------------------
# LIGHTING
# ----------------------------------------------------------------------------

def add_sun(name, energy, color, rot_euler, angle_deg=0.25):
    light_data = bpy.data.lights.new(name, type="SUN")
    light_data.energy = energy
    light_data.color = color
    light_data.angle = radians(angle_deg)
    obj = bpy.data.objects.new(name, light_data)
    obj.rotation_euler = rot_euler
    scene.collection.objects.link(obj)
    return obj

add_sun("Light_Key", 4.0, (1.0, 0.96, 0.90),
        (radians(55), radians(-12), radians(-40)), angle_deg=0.25)
add_sun("Light_Fill", 0.5, (0.45, 0.75, 0.90),
        (radians(70), radians(20), radians(135)), angle_deg=3.0)
add_sun("Light_Rim", 3.0, (1.0, 0.78, 0.45),
        (radians(-105), radians(0), radians(25)), angle_deg=1.0)

# ----------------------------------------------------------------------------
# CAMERA
# ----------------------------------------------------------------------------

cam_data = bpy.data.cameras.new("Camera_Main")
cam_data.lens = 50.0
cam_data.sensor_width = 36.0
cam_data.dof.use_dof = True
cam_data.dof.aperture_fstop = 2.8

cam = bpy.data.objects.new("Camera_Main", cam_data)
cam.location = Vector((0.0, -7.6, 2.05))
target = Vector((0.7, 0.0, 0.0))
direction = target - cam.location
cam.rotation_mode = "QUATERNION"
cam.rotation_quaternion = direction.to_track_quat("-Z", "Y")
cam_data.dof.focus_distance = (cam.location.length - PLANET_RADIUS)
scene.collection.objects.link(cam)
scene.camera = cam

# ----------------------------------------------------------------------------
# RENDER SETTINGS — Cycles
# ----------------------------------------------------------------------------

scene.render.engine = "CYCLES"
scene.cycles.samples = CFG["samples"]
scene.cycles.use_adaptive_sampling = True
scene.cycles.use_denoising = True
try:
    scene.cycles.denoiser = "OPENIMAGEDENOISE"
except Exception:
    pass
scene.cycles.max_bounces = 12
scene.cycles.caustics_reflective = False
scene.cycles.caustics_refractive = False
try:
    scene.cycles.device = "GPU"
    prefs = bpy.context.preferences.addons["cycles"].preferences
    prefs.compute_device_type = next(
        (t for t in ("OPTIX", "CUDA", "METAL", "HIP", "ONEAPI")
         if prefs.get_devices_for_type(t)), "NONE")
    for dev in prefs.devices:
        dev.use = True
except Exception:
    scene.cycles.device = "CPU"

scene.render.resolution_x, scene.render.resolution_y = CFG["res"]

try:
    scene.view_settings.view_transform = "Filmic"
    scene.view_settings.look = "High Contrast"
except TypeError:
    scene.view_settings.look = "AgX - High Contrast"

# Compositor bloom — handles <=4.4, 4.5+, and 5.x APIs
ct = None
if hasattr(scene, "compositing_node_group"):
    ct = bpy.data.node_groups.new("Compositing", "CompositorNodeTree")
    scene.compositing_node_group = ct
elif hasattr(scene, "node_tree"):
    scene.use_nodes = True
    ct = scene.node_tree
    ct.nodes.clear()

if ct is not None:
    rl = ct.nodes.new("CompositorNodeRLayers")
    glare = ct.nodes.new("CompositorNodeGlare")
    glare.location = (300, 0)
    try:
        comp = ct.nodes.new("CompositorNodeComposite")
    except RuntimeError:
        comp = ct.nodes.new("NodeGroupOutput")
        ct.interface.new_socket("Image", in_out="OUTPUT",
                                socket_type="NodeSocketColor")
    comp.location = (600, 0)

    if hasattr(glare, "glare_type"):
        try:
            glare.glare_type = "BLOOM"
        except TypeError:
            glare.glare_type = "FOG_GLOW"
    else:
        mode_sock = next((s for s in glare.inputs
                          if s.name in ("Type", "Mode", "Glare Type")), None)
        if mode_sock is not None:
            for val in ("Bloom", "BLOOM", "Fog Glow", "FOG_GLOW"):
                try:
                    mode_sock.default_value = val
                    break
                except (TypeError, ValueError):
                    continue

    def set_glare(sock_name, attr_old, sock_value, attr_value):
        if sock_name in glare.inputs:
            try:
                glare.inputs[sock_name].default_value = sock_value
            except (TypeError, ValueError):
                pass
        elif hasattr(glare, attr_old):
            setattr(glare, attr_old, attr_value)

    set_glare("Threshold", "threshold", 0.8, 0.8)
    set_glare("Size", "size", 0.85, 6)
    set_glare("Strength", "mix", 0.15, -0.7)
    set_glare("Saturation", "saturation", 1.0, 1.0)

    ct.links.new(rl.outputs["Image"], glare.inputs["Image"])
    ct.links.new(glare.outputs["Image"], comp.inputs[0])

# ----------------------------------------------------------------------------
# EXPORT
# ----------------------------------------------------------------------------

def export_glb(filepath=EXPORT_GLB_PATH):
    """Export the Earth hierarchy as .glb (textures are embedded).
    The website rebuilds atmosphere and clickable POIs in React Three Fiber."""
    MODELS_DIR.mkdir(parents=True, exist_ok=True)
    bpy.ops.object.select_all(action="DESELECT")
    def select_tree(obj):
        if obj.name in WEB_EXPORT_SKIP_OBJECTS:
            return
        obj.select_set(True)
        for child in obj.children:
            select_tree(child)
    select_tree(root)
    bpy.ops.export_scene.gltf(
        filepath=bpy.path.abspath(filepath),
        export_format="GLB",
        use_selection=True,
        export_yup=True,
        export_apply=True,
    )
    print(f"Exported -> {filepath}")

if EXPORT_ON_RUN:
    export_glb()

print(f"Painted Earth built ({QUALITY}). Web export: {EXPORT_GLB_PATH}")
