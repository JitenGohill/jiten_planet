import { Box3, Matrix4, type Object3D, Vector3 } from "three";

import { GLOBE_RADIUS } from "../constants";

type GeometryObject = Object3D & {
  geometry?: {
    boundingBox: Box3 | null;
    computeBoundingBox: () => void;
  };
};

export function getVisibleModelRadius(root: Object3D) {
  const sceneBox = new Box3();
  const objectBox = new Box3();
  const rootMatrix = new Matrix4();
  const size = new Vector3();
  let hasBounds = false;

  root.traverse((object) => {
    if (object.matrixAutoUpdate) {
      object.updateMatrix();
    }
  });

  function includeObject(object: Object3D, parentMatrix: Matrix4) {
    if (!object.visible) {
      return;
    }

    const localMatrix = parentMatrix.clone().multiply(object.matrix);

    if ("geometry" in object) {
      const geometry = (object as GeometryObject).geometry;

      if (geometry) {
        if (!geometry.boundingBox) {
          geometry.computeBoundingBox();
        }

        if (geometry.boundingBox) {
          objectBox.copy(geometry.boundingBox).applyMatrix4(localMatrix);

          if (hasBounds) {
            sceneBox.union(objectBox);
          } else {
            sceneBox.copy(objectBox);
            hasBounds = true;
          }
        }
      }
    }

    for (const child of object.children) {
      includeObject(child, localMatrix);
    }
  }

  includeObject(root, rootMatrix);

  if (!hasBounds) {
    return GLOBE_RADIUS;
  }

  sceneBox.getSize(size);

  return Math.max(size.x, size.y, size.z) / 2;
}
