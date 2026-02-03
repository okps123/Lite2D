import { Scene } from './Scene';
import { InputManager } from '../input/InputManager';
import { AssetLoader } from '../assets/AssetLoader';
import { SoundManager } from '../audio/SoundManager';

/**
 * Engine 클래스
 * 게임 루프 및 전체 엔진을 관리합니다.
 */
export class Engine {
  private _canvas: HTMLCanvasElement;
  private _ctx: CanvasRenderingContext2D;
  private _currentScene: Scene | null = null;
  private _isRunning: boolean = false;
  private _targetFPS: number = 60;
  private _deltaTime: number = 0;
  private _lastFrameTime: number = 0;
  private _frameCount: number = 0;
  private _fps: number = 0;
  private _fpsUpdateTime: number = 0;

  private _inputManager: InputManager;
  private _assetLoader: AssetLoader;
  private _soundManager: SoundManager;

  private _requestId: number = 0;

  constructor(canvasId: string, width: number, height: number) {
    // Canvas 찾기 또는 생성
    let canvas = document.getElementById(canvasId) as HTMLCanvasElement;
    if (!canvas) {
      canvas = document.createElement('canvas');
      canvas.id = canvasId;
      document.body.appendChild(canvas);
    }

    this._canvas = canvas;
    this._canvas.width = width;
    this._canvas.height = height;

    // Context 가져오기
    const ctx = this._canvas.getContext('2d');
    if (!ctx) {
      throw new Error('Canvas 2D 컨텍스트를 가져올 수 없습니다.');
    }
    this._ctx = ctx;

    // 매니저들 초기화
    this._inputManager = new InputManager(this._canvas);
    this._assetLoader = new AssetLoader();
    this._soundManager = new SoundManager(this._assetLoader);
  }

  /**
   * Canvas 요소
   */
  get canvas(): HTMLCanvasElement {
    return this._canvas;
  }

  /**
   * Canvas 렌더링 컨텍스트
   */
  get ctx(): CanvasRenderingContext2D {
    return this._ctx;
  }

  /**
   * 현재 활성 씬
   */
  get currentScene(): Scene | null {
    return this._currentScene;
  }

  /**
   * 엔진 실행 중 여부
   */
  get isRunning(): boolean {
    return this._isRunning;
  }

  /**
   * 목표 FPS
   */
  get targetFPS(): number {
    return this._targetFPS;
  }

  set targetFPS(value: number) {
    this._targetFPS = value;
  }

  /**
   * 프레임 간 시간 (초 단위)
   */
  get deltaTime(): number {
    return this._deltaTime;
  }

  /**
   * 현재 FPS
   */
  get fps(): number {
    return this._fps;
  }

  /**
   * InputManager
   */
  get inputManager(): InputManager {
    return this._inputManager;
  }

  /**
   * AssetLoader
   */
  get assetLoader(): AssetLoader {
    return this._assetLoader;
  }

  /**
   * SoundManager
   */
  get soundManager(): SoundManager {
    return this._soundManager;
  }

  /**
   * 씬 로드
   */
  async loadScene(scene: Scene): Promise<void> {
    // 기존 씬 언로드
    if (this._currentScene !== null) {
      this._currentScene.engine = null;
      this._currentScene.unload();
    }

    // 새 씬 설정
    this._currentScene = scene;
    scene.engine = this;

    // 씬 로드
    await scene.load();
  }

  /**
   * 게임 시작
   */
  start(): void {
    if (this._isRunning) {
      console.warn('엔진이 이미 실행 중입니다.');
      return;
    }

    this._isRunning = true;
    this._lastFrameTime = 0;
    this._fpsUpdateTime = 0;
    this._frameCount = 0;

    // 게임 루프 시작
    this._requestId = requestAnimationFrame((timestamp) =>
      this.gameLoop(timestamp)
    );

    console.log('게임 엔진 시작');
  }

  /**
   * 게임 중지
   */
  stop(): void {
    if (!this._isRunning) {
      return;
    }

    this._isRunning = false;
    if (this._requestId) {
      cancelAnimationFrame(this._requestId);
      this._requestId = 0;
    }

    console.log('게임 엔진 중지');
  }

  /**
   * 게임 루프 (requestAnimationFrame)
   */
  private gameLoop(timestamp: number): void {
    if (!this._isRunning) return;

    // 첫 프레임 초기화
    if (this._lastFrameTime === 0) {
      this._lastFrameTime = timestamp;
      this._fpsUpdateTime = timestamp;
    }

    // Delta Time 계산 (초 단위)
    this._deltaTime = (timestamp - this._lastFrameTime) / 1000;

    // Delta Time이 너무 크면 제한 (예: 탭 전환 후 복귀)
    if (this._deltaTime > 0.1) {
      this._deltaTime = 0.016; // ~60fps
    }

    this._lastFrameTime = timestamp;

    // FPS 계산
    this._frameCount++;
    if (timestamp - this._fpsUpdateTime >= 1000) {
      this._fps = this._frameCount;
      this._frameCount = 0;
      this._fpsUpdateTime = timestamp;
    }

    // Update 단계
    this.update(this._deltaTime);

    // Render 단계
    this.render();

    // 다음 프레임 예약
    this._requestId = requestAnimationFrame((t) => this.gameLoop(t));
  }

  /**
   * Update 단계
   */
  private update(deltaTime: number): void {
    // Input 처리
    this._inputManager.update();

    // Sound 처리 (페이드 등)
    this._soundManager.update(deltaTime);

    // 물리 업데이트 (Scene 업데이트 전에 실행)
    if (this._currentScene !== null) {
      const { PhysicsManager } = require('../physics/PhysicsManager');
      PhysicsManager.getInstance().update(deltaTime);
    }

    // 현재 씬 업데이트
    if (this._currentScene !== null) {
      this._currentScene.update(deltaTime);
    }
  }

  /**
   * Render 단계
   */
  private render(): void {
    // Canvas 클리어
    this._ctx.clearRect(0, 0, this._canvas.width, this._canvas.height);

    // 배경색 그리기
    if (this._currentScene) {
      this._ctx.fillStyle = this._currentScene.backgroundColor;
      this._ctx.fillRect(0, 0, this._canvas.width, this._canvas.height);
    }

    // 씬 렌더링 (카메라 변환은 각 Layer가 처리)
    if (this._currentScene !== null) {
      this._currentScene.render(this._ctx);
    }
  }

  /**
   * Canvas 크기 변경
   */
  resizeCanvas(width: number, height: number): void {
    this._canvas.width = width;
    this._canvas.height = height;

    // 현재 씬의 카메라 뷰포트도 업데이트
    if (this._currentScene) {
      this._currentScene.camera.viewportWidth = width;
      this._currentScene.camera.viewportHeight = height;
    }
  }

  /**
   * FPS 표시 (디버그용)
   */
  drawFPS(x: number = 10, y: number = 20, color: string = '#00ff00'): void {
    this._ctx.save();
    this._ctx.setTransform(1, 0, 0, 1, 0, 0); // 카메라 변환 무시
    this._ctx.fillStyle = color;
    this._ctx.font = '16px monospace';
    this._ctx.fillText(`FPS: ${this._fps}`, x, y);
    this._ctx.restore();
  }

  /**
   * 엔진 정보를 문자열로 반환
   */
  toString(): string {
    return `Engine(running: ${this._isRunning}, fps: ${this._fps}, scene: ${
      this._currentScene?.name || 'none'
    })`;
  }

  /**
   * 엔진 정리
   */
  destroy(): void {
    this.stop();
    this._inputManager.destroy();
    this._soundManager.destroy();
    this._assetLoader.unloadAll();
    if (this._currentScene) {
      this._currentScene.unload();
    }
  }
}
