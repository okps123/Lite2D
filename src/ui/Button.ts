import { UIElement } from './UIElement';
import { Label } from './Label';
import type { ButtonStyle, UIEventCallback } from './types';

/**
 * Button 클래스
 * 클릭 가능한 버튼 UI 요소입니다.
 */
export class Button extends UIElement {
  // 구성 요소
  private _label: Label | null = null; // 텍스트 버튼
  private _image: HTMLImageElement | null = null; // 이미지 버튼
  private _imageWidth: number = 0;
  private _imageHeight: number = 0;

  // 상태별 스타일
  private _normalStyle: ButtonStyle;
  private _hoverStyle: ButtonStyle;
  private _pressedStyle: ButtonStyle;
  private _disabledStyle: ButtonStyle;

  // 콜백
  private _onClick: UIEventCallback | null = null;
  private _onPress: UIEventCallback | null = null;
  private _onRelease: UIEventCallback | null = null;

  // 상태
  private _pressed: boolean = false;

  constructor(name: string = 'Button') {
    super(name);

    // 기본 스타일 설정
    this._normalStyle = {
      backgroundColor: '#3498db',
      borderColor: '#2980b9',
      borderWidth: 2,
      textColor: '#ffffff',
      scale: 1.0,
    };

    this._hoverStyle = {
      backgroundColor: '#5dade2',
      borderColor: '#3498db',
      borderWidth: 2,
      textColor: '#ffffff',
      scale: 1.05,
    };

    this._pressedStyle = {
      backgroundColor: '#2980b9',
      borderColor: '#1c6ba0',
      borderWidth: 2,
      textColor: '#cccccc',
      scale: 0.95,
    };

    this._disabledStyle = {
      backgroundColor: '#95a5a6',
      borderColor: '#7f8c8d',
      borderWidth: 2,
      textColor: '#bdc3c7',
      scale: 1.0,
    };
  }

  /**
   * Normal 상태 스타일
   */
  get normalStyle(): ButtonStyle {
    return this._normalStyle;
  }

  set normalStyle(value: ButtonStyle) {
    this._normalStyle = value;
  }

  /**
   * Hover 상태 스타일
   */
  get hoverStyle(): ButtonStyle {
    return this._hoverStyle;
  }

  set hoverStyle(value: ButtonStyle) {
    this._hoverStyle = value;
  }

  /**
   * Pressed 상태 스타일
   */
  get pressedStyle(): ButtonStyle {
    return this._pressedStyle;
  }

  set pressedStyle(value: ButtonStyle) {
    this._pressedStyle = value;
  }

  /**
   * Disabled 상태 스타일
   */
  get disabledStyle(): ButtonStyle {
    return this._disabledStyle;
  }

  set disabledStyle(value: ButtonStyle) {
    this._disabledStyle = value;
  }

  /**
   * 텍스트 설정
   * @param text 버튼에 표시할 텍스트
   */
  setText(text: string): void {
    if (!this._label) {
      // Label 생성
      this._label = new Label(`${this.name}_Label`);
      this._label.textAlign = 'center';
      this._label.verticalAlign = 'middle';
      this._label.screenSpace = this._screenSpace;
    }

    this._label.setText(text);
    this._image = null; // 텍스트 버튼으로 전환
  }

  /**
   * 이미지 설정
   * @param image 버튼에 표시할 이미지
   * @param width 이미지 너비 (옵션)
   * @param height 이미지 높이 (옵션)
   */
  setImage(
    image: HTMLImageElement,
    width?: number,
    height?: number
  ): void {
    this._image = image;
    this._imageWidth = width || image.width;
    this._imageHeight = height || image.height;
    this._label = null; // 이미지 버튼으로 전환
  }

  /**
   * 클릭 콜백 설정
   * @param callback 클릭 시 실행할 함수
   */
  setOnClick(callback: UIEventCallback): void {
    this._onClick = callback;
  }

  /**
   * Press 콜백 설정
   * @param callback 마우스 다운 시 실행할 함수
   */
  setOnPress(callback: UIEventCallback): void {
    this._onPress = callback;
  }

  /**
   * Release 콜백 설정
   * @param callback 마우스 업 시 실행할 함수
   */
  setOnRelease(callback: UIEventCallback): void {
    this._onRelease = callback;
  }

  /**
   * 현재 상태에 따른 스타일 반환
   * @returns 현재 적용할 스타일
   */
  private getCurrentStyle(): ButtonStyle {
    if (!this._enabled) {
      return this._disabledStyle;
    }
    if (this._pressed) {
      return this._pressedStyle;
    }
    if (this._hovered) {
      return this._hoverStyle;
    }
    return this._normalStyle;
  }

  /**
   * 마우스가 버튼 위로 진입했을 때
   */
  onMouseEnter(): void {
    // 부모 클래스에서 hovered 플래그 설정됨
  }

  /**
   * 마우스가 버튼에서 벗어났을 때
   */
  onMouseLeave(): void {
    // 부모 클래스에서 hovered 플래그 해제됨
  }

  /**
   * 마우스 버튼을 눌렀을 때
   */
  onMouseDown(): void {
    if (!this._enabled) return;

    this._pressed = true;

    if (this._onPress) {
      this._onPress();
    }
  }

  /**
   * 마우스 버튼을 뗐을 때
   */
  onMouseUp(): void {
    if (!this._enabled) return;

    this._pressed = false;

    if (this._onRelease) {
      this._onRelease();
    }
  }

  /**
   * 클릭했을 때
   */
  onClick(): void {
    if (!this._enabled) return;

    if (this._onClick) {
      this._onClick();
    }
  }

  /**
   * 렌더링
   * @param ctx Canvas 렌더링 컨텍스트
   */
  onRender(ctx: CanvasRenderingContext2D): void {
    ctx.save();

    // 현재 스타일 가져오기
    const style = this.getCurrentStyle();

    // 투명도 적용
    ctx.globalAlpha = this._opacity;

    // 경계 영역 계산
    const bounds = this.getScreenBounds();

    // scale 효과 적용 (중앙 기준)
    const centerX = bounds.x + bounds.width / 2;
    const centerY = bounds.y + bounds.height / 2;

    ctx.translate(centerX, centerY);
    ctx.scale(style.scale, style.scale);
    ctx.translate(-centerX, -centerY);

    // 배경 렌더링
    ctx.fillStyle = style.backgroundColor;
    ctx.fillRect(bounds.x, bounds.y, bounds.width, bounds.height);

    // 테두리 렌더링
    if (style.borderWidth > 0) {
      ctx.strokeStyle = style.borderColor;
      ctx.lineWidth = style.borderWidth;
      ctx.strokeRect(bounds.x, bounds.y, bounds.width, bounds.height);
    }

    // 텍스트 또는 이미지 렌더링
    if (this._label) {
      // 텍스트 버튼
      // Label의 위치와 크기를 버튼과 동일하게 설정
      this._label.transform.position.set(
        this.transform.position.x,
        this.transform.position.y
      );
      this._label.width = this._width;
      this._label.height = this._height;
      this._label.anchor = this._anchor.clone();
      this._label.textColor = style.textColor;
      this._label.screenSpace = this._screenSpace;

      // Label 렌더링
      this._label.onRender(ctx);
    } else if (this._image) {
      // 이미지 버튼
      const imgX = bounds.x + (bounds.width - this._imageWidth) / 2;
      const imgY = bounds.y + (bounds.height - this._imageHeight) / 2;

      ctx.drawImage(
        this._image,
        imgX,
        imgY,
        this._imageWidth,
        this._imageHeight
      );
    }

    ctx.restore();
  }
}
