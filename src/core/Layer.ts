import { GameObject } from './GameObject';
import { Camera } from '../rendering/Camera';

/**
 * Layer 클래스
 *
 * Godot의 CanvasLayer와 유사하게 독립적인 렌더링 레이어를 제공합니다.
 * GameObject를 상속받아 기존 parent-child 시스템을 그대로 활용합니다.
 *
 * 사용 예:
 * ```typescript
 * // World Layer - 카메라 변환 적용
 * const worldLayer = new Layer('World', scene.camera);
 * worldLayer.addChild(player);
 * worldLayer.addChild(tileMap);
 *
 * // UI Layer - Screen Space (카메라 변환 없음)
 * const uiLayer = new Layer('UI', null);
 * uiLayer.sortingOrder = 1000;
 * uiLayer.addChild(hud);
 * ```
 */
export class Layer extends GameObject {
  private _camera: Camera | null;

  /**
   * Layer 생성
   * @param name 레이어 이름
   * @param camera 적용할 카메라 (null이면 Screen Space)
   */
  constructor(name: string, camera: Camera | null = null) {
    super(name);
    this._camera = camera;
  }

  /**
   * 레이어에 적용되는 카메라
   * null이면 Screen Space (카메라 변환 없음)
   */
  get camera(): Camera | null {
    return this._camera;
  }

  set camera(value: Camera | null) {
    this._camera = value;
  }

  /**
   * 레이어 렌더링
   * 카메라가 있으면 변환 적용 후 자식들을 렌더링합니다.
   */
  render(ctx: CanvasRenderingContext2D): void {
    if (!this.active) return;

    ctx.save();

    // 카메라가 있으면 변환 적용, 없으면 Screen Space
    if (this._camera) {
      this._camera.applyTransform(ctx);
    }

    // 자식들을 sortingOrder 순서로 렌더링
    // (children은 이미 sortingOrder로 정렬되어 있음)
    for (const child of this.children) {
      if (child.active) {
        child.render(ctx);
      }
    }

    ctx.restore();
  }

  /**
   * Layer의 onRender는 아무것도 하지 않음
   * (자식 렌더링은 render()에서 직접 처리)
   */
  onRender(_ctx: CanvasRenderingContext2D): void {
    // 빈 구현 - Layer 자체는 렌더링하지 않음
  }
}
