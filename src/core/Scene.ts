import { GameObject } from './GameObject';
import { Layer } from './Layer';
import { Camera } from '../rendering/Camera';
import type { Engine } from './Engine';

/**
 * Scene 클래스
 * 게임 씬을 관리합니다.
 * Cocos2D의 Scene과 유사한 역할을 합니다.
 */
export class Scene {
  private _name: string;
  private _rootObjects: GameObject[] = [];
  private _camera: Camera;
  private _isLoaded: boolean = false;
  private _backgroundColor: string = '#000000';
  private _engine: Engine | null = null;

  // 기본 레이어
  private _worldLayer: Layer;
  private _uiLayer: Layer;

  constructor(name: string, viewportWidth: number, viewportHeight: number) {
    this._name = name;
    this._camera = new Camera(viewportWidth, viewportHeight);

    // 기본 레이어 생성
    this._worldLayer = new Layer('World', this._camera);
    this._uiLayer = new Layer('UI', null);
    this._uiLayer.sortingOrder = 1000;

    // 씬에 추가
    this.addGameObject(this._worldLayer);
    this.addGameObject(this._uiLayer);
  }

  /**
   * World Layer (카메라 변환 적용)
   */
  get world(): Layer {
    return this._worldLayer;
  }

  /**
   * UI Layer (Screen Space)
   */
  get ui(): Layer {
    return this._uiLayer;
  }

  /**
   * 씬 이름
   */
  get name(): string {
    return this._name;
  }

  /**
   * 루트 레벨 GameObject 목록
   */
  get rootObjects(): readonly GameObject[] {
    return this._rootObjects;
  }

  /**
   * 씬의 카메라
   */
  get camera(): Camera {
    return this._camera;
  }

  /**
   * 씬이 속한 Engine
   */
  get engine(): Engine | null {
    return this._engine;
  }

  set engine(value: Engine | null) {
    this._engine = value;
  }

  /**
   * 씬 로드 완료 여부
   */
  get isLoaded(): boolean {
    return this._isLoaded;
  }

  /**
   * 배경색
   */
  get backgroundColor(): string {
    return this._backgroundColor;
  }

  set backgroundColor(value: string) {
    this._backgroundColor = value;
  }

  /**
   * 씬 로드
   */
  async load(): Promise<void> {
    if (this._isLoaded) return;

    // 모든 GameObject의 awake 호출
    for (const obj of this._rootObjects) {
      this.callAwakeRecursive(obj);
    }

    this._isLoaded = true;
  }

  /**
   * GameObject와 그 자식들의 awake를 재귀적으로 호출
   */
  private callAwakeRecursive(obj: GameObject): void {
    obj.awake();
    for (const child of obj.children) {
      this.callAwakeRecursive(child);
    }
  }

  /**
   * 씬 언로드
   */
  unload(): void {
    // 모든 GameObject 파괴
    for (const obj of [...this._rootObjects]) {
      obj.destroy();
    }
    this._rootObjects = [];
    this._isLoaded = false;
  }

  /**
   * GameObject 추가 (루트 레벨)
   */
  addGameObject(obj: GameObject): void {
    if (obj.parent !== null) {
      throw new Error(
        'GameObject가 이미 다른 GameObject의 자식입니다. 먼저 부모에서 제거하세요.'
      );
    }

    if (this._rootObjects.includes(obj)) {
      return; // 이미 추가된 경우
    }

    // sortingOrder에 따라 정렬된 위치에 삽입
    const insertIndex = this.findInsertPosition(obj.sortingOrder);
    this._rootObjects.splice(insertIndex, 0, obj);
    obj.scene = this;

    // 씬이 이미 로드된 경우 awake 호출
    if (this._isLoaded) {
      this.callAwakeRecursive(obj);
    }
  }

  /**
   * sortingOrder에 맞는 삽입 위치 찾기 (Binary Search)
   */
  private findInsertPosition(sortingOrder: number): number {
    let left = 0;
    let right = this._rootObjects.length;

    while (left < right) {
      const mid = Math.floor((left + right) / 2);
      if (this._rootObjects[mid].sortingOrder < sortingOrder) {
        left = mid + 1;
      } else {
        right = mid;
      }
    }

    return left;
  }

  /**
   * GameObject의 sortingOrder 변경 시 재정렬
   */
  reorderGameObject(obj: GameObject): void {
    const index = this._rootObjects.indexOf(obj);
    if (index === -1) {
      return; // 없는 경우
    }

    // 제거 후 올바른 위치에 재삽입
    this._rootObjects.splice(index, 1);
    const insertIndex = this.findInsertPosition(obj.sortingOrder);
    this._rootObjects.splice(insertIndex, 0, obj);
  }

  /**
   * GameObject 제거
   */
  removeGameObject(obj: GameObject): void {
    const index = this._rootObjects.indexOf(obj);
    if (index === -1) {
      return; // 없는 경우
    }

    this._rootObjects.splice(index, 1);
    obj.scene = null;
  }

  /**
   * 이름으로 GameObject 찾기 (루트 레벨만)
   */
  findGameObject(name: string): GameObject | null {
    for (const obj of this._rootObjects) {
      if (obj.name === name) {
        return obj;
      }
    }
    return null;
  }

  /**
   * 이름으로 GameObject 재귀 검색 (모든 자식 포함)
   */
  findGameObjectRecursive(name: string): GameObject | null {
    for (const obj of this._rootObjects) {
      if (obj.name === name) {
        return obj;
      }
      const found = obj.findChildRecursive(name);
      if (found !== null) {
        return found;
      }
    }
    return null;
  }

  /**
   * 특정 타입의 모든 GameObject 찾기
   */
  findGameObjectsOfType<T extends GameObject>(
    type: new (...args: any[]) => T
  ): T[] {
    const result: T[] = [];
    for (const obj of this._rootObjects) {
      this.findGameObjectsOfTypeRecursive(obj, type, result);
    }
    return result;
  }

  /**
   * 재귀적으로 특정 타입의 GameObject 찾기
   */
  private findGameObjectsOfTypeRecursive<T extends GameObject>(
    obj: GameObject,
    type: new (...args: any[]) => T,
    result: T[]
  ): void {
    if (obj instanceof type) {
      result.push(obj as T);
    }
    for (const child of obj.children) {
      this.findGameObjectsOfTypeRecursive(child, type, result);
    }
  }

  /**
   * 모든 GameObject 업데이트
   */
  update(deltaTime: number): void {
    if (!this._isLoaded) return;

    // 루트 GameObject들의 update 호출 (자식들은 재귀적으로 호출됨)
    for (const obj of this._rootObjects) {
      if (obj.active) {
        obj.update(deltaTime);
      }
    }
  }

  /**
   * 모든 GameObject 렌더링
   */
  render(ctx: CanvasRenderingContext2D): void {
    if (!this._isLoaded) return;

    // _rootObjects는 이미 sortingOrder로 정렬되어 있음 (Cocos2d 방식)
    // 단순히 순회만 하면 됨
    for (const obj of this._rootObjects) {
      if (obj.active) {
        obj.render(ctx);
      }
    }
  }

  /**
   * 씬에 있는 모든 GameObject 개수 (자식 포함)
   */
  getTotalObjectCount(): number {
    let count = 0;
    for (const obj of this._rootObjects) {
      count += this.countObjectsRecursive(obj);
    }
    return count;
  }

  /**
   * 재귀적으로 GameObject 개수 세기
   */
  private countObjectsRecursive(obj: GameObject): number {
    let count = 1; // 자기 자신
    for (const child of obj.children) {
      count += this.countObjectsRecursive(child);
    }
    return count;
  }

  /**
   * World Layer 생성 헬퍼
   * 씬의 카메라가 적용되는 레이어를 생성하고 씬에 추가합니다.
   * @param name 레이어 이름 (기본값: 'World')
   * @returns 생성된 Layer
   */
  createWorldLayer(name: string = 'World'): Layer {
    const layer = new Layer(name, this._camera);
    this.addGameObject(layer);
    return layer;
  }

  /**
   * UI Layer 생성 헬퍼
   * Screen Space 레이어를 생성하고 씬에 추가합니다.
   * @param name 레이어 이름 (기본값: 'UI')
   * @param sortingOrder 렌더링 순서 (기본값: 1000)
   * @returns 생성된 Layer
   */
  createUILayer(name: string = 'UI', sortingOrder: number = 1000): Layer {
    const layer = new Layer(name, null);
    layer.sortingOrder = sortingOrder;
    this.addGameObject(layer);
    return layer;
  }

  /**
   * 씬 정보를 문자열로 반환
   */
  toString(): string {
    return `Scene(${this._name}, objects: ${this._rootObjects.length}, total: ${this.getTotalObjectCount()})`;
  }
}
