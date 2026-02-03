import { UIElement } from './UIElement';
import { Label } from './Label';
import { Button } from './Button';
import type { UIManager } from './UIManager';
import type { UIEventCallback } from './types';

/**
 * Dialog 클래스
 * 모달 방식의 대화상자 UI 요소입니다.
 * 제목, 본문, 버튼들로 구성됩니다.
 */
export class Dialog extends UIElement {
  // 구성 요소
  private _titleLabel: Label;
  private _messageLabel: Label;
  private _buttons: Button[] = [];

  // 배경 딤 설정
  private _dimBackground: boolean = true;
  private _dimColor: string = 'rgba(0, 0, 0, 0.5)';

  // 다이얼로그 스타일
  private _dialogWidth: number = 400;
  private _dialogHeight: number = 250;
  private _dialogBackgroundColor: string = '#2c3e50';
  private _dialogBorderColor: string = '#3498db';
  private _dialogBorderWidth: number = 2;

  // 콜백
  private _onClose: UIEventCallback | null = null;

  // UIManager 참조 (버튼 등록용)
  private _uiManager: UIManager | null = null;

  constructor(name: string = 'Dialog') {
    super(name);

    // Dialog는 항상 Screen Space (화면 중앙)
    this._screenSpace = true;
    this._interactive = false; // Dialog 자체는 클릭 불가 (배경 딤 영역)

    // 크기 설정 (fullscreen)
    this._width = 0;
    this._height = 0;

    // 제목 Label 생성
    this._titleLabel = new Label(`${name}_Title`);
    this._titleLabel.screenSpace = true;
    this._titleLabel.setFont(20, 'Arial');
    this._titleLabel.textColor = '#ffffff';
    this._titleLabel.textAlign = 'center';
    this._titleLabel.verticalAlign = 'top';
    this._titleLabel.width = this._dialogWidth - 40;
    this._titleLabel.height = 40;
    this._titleLabel.sortingOrder = this.sortingOrder + 1;

    // 본문 Label 생성
    this._messageLabel = new Label(`${name}_Message`);
    this._messageLabel.screenSpace = true;
    this._messageLabel.setFont(16, 'Arial');
    this._messageLabel.textColor = '#ecf0f1';
    this._messageLabel.textAlign = 'center';
    this._messageLabel.verticalAlign = 'top';
    this._messageLabel.width = this._dialogWidth - 40;
    this._messageLabel.height = 100;
    this._messageLabel.maxWidth = this._dialogWidth - 40;
    this._messageLabel.sortingOrder = this.sortingOrder + 1;
  }

  /**
   * 다이얼로그 너비
   */
  get dialogWidth(): number {
    return this._dialogWidth;
  }

  set dialogWidth(value: number) {
    this._dialogWidth = value;
    this._titleLabel.width = value - 40;
    this._messageLabel.width = value - 40;
    this._messageLabel.maxWidth = value - 40;
    this.updateLayout();
  }

  /**
   * 다이얼로그 높이
   */
  get dialogHeight(): number {
    return this._dialogHeight;
  }

  set dialogHeight(value: number) {
    this._dialogHeight = value;
    this.updateLayout();
  }

  /**
   * 배경 딤 여부
   */
  get dimBackground(): boolean {
    return this._dimBackground;
  }

  set dimBackground(value: boolean) {
    this._dimBackground = value;
  }

  /**
   * 딤 색상
   */
  get dimColor(): string {
    return this._dimColor;
  }

  set dimColor(value: string) {
    this._dimColor = value;
  }

  /**
   * onClose 콜백
   */
  set onClose(callback: UIEventCallback | null) {
    this._onClose = callback;
  }

  /**
   * 제목 설정
   * @param title 제목 텍스트
   */
  setTitle(title: string): void {
    this._titleLabel.setText(title);
  }

  /**
   * 본문 설정
   * @param message 본문 텍스트
   */
  setMessage(message: string): void {
    this._messageLabel.setText(message);
  }

  /**
   * 버튼 추가
   * @param text 버튼 텍스트
   * @param callback 버튼 클릭 시 콜백
   * @param closeOnClick 클릭 시 다이얼로그 자동 닫기 (기본값: true)
   * @returns 생성된 버튼
   */
  addButton(
    text: string,
    callback: UIEventCallback | null = null,
    closeOnClick: boolean = true
  ): Button {
    const button = new Button(`${this.name}_Button${this._buttons.length}`);
    button.screenSpace = true;
    button.setText(text);
    button.width = 100;
    button.height = 40;
    button.sortingOrder = this.sortingOrder + 1;

    // 버튼 클릭 시 콜백 및 닫기 처리
    button.setOnClick(() => {
      if (callback) {
        callback();
      }
      if (closeOnClick) {
        this.close();
      }
    });

    this._buttons.push(button);
    this.updateLayout();

    return button;
  }

  /**
   * 다이얼로그 닫기
   */
  close(): void {
    if (this._onClose) {
      this._onClose();
    }

    // destroy()를 호출하여 모든 자식 요소들을 정리
    this.destroy();
  }

  /**
   * 다이얼로그 표시 (Scene에 추가)
   * @param uiManager UIManager 인스턴스 (버튼 클릭 이벤트 처리용)
   */
  show(uiManager?: UIManager): void {
    if (!this.scene || !this.scene.engine) {
      console.warn('Dialog: Scene이나 Engine이 설정되지 않았습니다.');
      return;
    }

    // UIManager 저장
    if (uiManager) {
      this._uiManager = uiManager;
    }

    // 화면 크기 가져오기
    const canvasWidth = this.scene.engine.canvas.width;
    const canvasHeight = this.scene.engine.canvas.height;

    // Fullscreen 크기 설정 (배경 딤용)
    this._width = canvasWidth;
    this._height = canvasHeight;
    this.transform.position.set(canvasWidth / 2, canvasHeight / 2);

    // 자식 요소들의 sortingOrder 업데이트 (Dialog보다 위에 표시)
    this._titleLabel.sortingOrder = this.sortingOrder + 1;
    this._messageLabel.sortingOrder = this.sortingOrder + 1;
    for (const button of this._buttons) {
      button.sortingOrder = this.sortingOrder + 1;
    }

    // 레이아웃 업데이트
    this.updateLayout();

    // Scene에 자식 요소들 추가
    if (this.scene) {
      this.scene.addGameObject(this._titleLabel);
      this.scene.addGameObject(this._messageLabel);

      for (const button of this._buttons) {
        this.scene.addGameObject(button);
      }
    }

    // UIManager에 자식 요소들 등록 (클릭 이벤트 처리용)
    if (this._uiManager) {
      this._uiManager.register(this._titleLabel);
      this._uiManager.register(this._messageLabel);

      for (const button of this._buttons) {
        this._uiManager.register(button);
      }
    }
  }

  /**
   * 레이아웃 업데이트 (중앙 정렬)
   */
  private updateLayout(): void {
    if (!this.scene || !this.scene.engine) return;

    const canvasWidth = this.scene.engine.canvas.width;
    const canvasHeight = this.scene.engine.canvas.height;

    // 다이얼로그 중앙 위치
    const dialogX = canvasWidth / 2;
    const dialogY = canvasHeight / 2;

    // 제목 위치
    this._titleLabel.transform.position.set(
      dialogX,
      dialogY - this._dialogHeight / 2 + 40
    );

    // 본문 위치
    this._messageLabel.transform.position.set(
      dialogX,
      dialogY - this._dialogHeight / 2 + 90
    );

    // 버튼 위치 (하단 중앙, 가로로 배치)
    const buttonY = dialogY + this._dialogHeight / 2 - 60;
    const buttonSpacing = 120;
    const totalButtonWidth = this._buttons.length * buttonSpacing;
    let startX = dialogX - totalButtonWidth / 2 + 50;

    for (const button of this._buttons) {
      button.transform.position.set(startX, buttonY);
      startX += buttonSpacing;
    }
  }

  /**
   * 렌더링
   * @param ctx Canvas 렌더링 컨텍스트
   */
  onRender(ctx: CanvasRenderingContext2D): void {
    ctx.save();

    // 배경 딤 렌더링
    if (this._dimBackground) {
      ctx.fillStyle = this._dimColor;
      ctx.fillRect(0, 0, this._width, this._height);
    }

    // 다이얼로그 박스 렌더링
    if (!this.scene || !this.scene.engine) {
      ctx.restore();
      return;
    }

    const canvasWidth = this.scene.engine.canvas.width;
    const canvasHeight = this.scene.engine.canvas.height;

    const dialogX = canvasWidth / 2 - this._dialogWidth / 2;
    const dialogY = canvasHeight / 2 - this._dialogHeight / 2;

    // 배경
    ctx.fillStyle = this._dialogBackgroundColor;
    ctx.fillRect(dialogX, dialogY, this._dialogWidth, this._dialogHeight);

    // 테두리
    ctx.strokeStyle = this._dialogBorderColor;
    ctx.lineWidth = this._dialogBorderWidth;
    ctx.strokeRect(dialogX, dialogY, this._dialogWidth, this._dialogHeight);

    ctx.restore();

    // 자식 요소들 (Label, Button)은 자동으로 렌더링됨
  }

  /**
   * 파괴 시 정리
   */
  destroy(): void {
    // UIManager에서 자식 요소들 등록 해제
    if (this._uiManager) {
      this._uiManager.unregister(this._titleLabel);
      this._uiManager.unregister(this._messageLabel);

      for (const button of this._buttons) {
        this._uiManager.unregister(button);
      }
    }

    // 자식 요소들 제거
    if (this.scene) {
      this.scene.removeGameObject(this._titleLabel);
      this.scene.removeGameObject(this._messageLabel);

      for (const button of this._buttons) {
        this.scene.removeGameObject(button);
      }
    }

    this._buttons = [];

    super.destroy();
  }
}
