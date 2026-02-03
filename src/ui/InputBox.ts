import { UIElement } from './UIElement';
import type { TextChangeCallback } from './types';

/**
 * InputBox 클래스
 * 텍스트 입력을 받는 UI 요소입니다.
 */
export class InputBox extends UIElement {
  // 텍스트 입력
  private _text: string = '';
  private _placeholder: string = '';
  private _placeholderColor: string = '#999999';
  private _textColor: string = '#ffffff';
  private _font: string = '16px Arial';

  // 커서
  private _cursorPosition: number = 0; // 문자 인덱스
  private _cursorVisible: boolean = true; // 깜빡임 상태
  private _cursorBlinkTime: number = 0; // 깜빡임 타이머
  private _cursorBlinkInterval: number = 0.5; // 깜빡임 간격 (초)
  private _cursorColor: string = '#ffffff';
  private _cursorWidth: number = 2;

  // 선택 영역 (추후 확장 가능)
  // private _selectionStart: number = 0;
  // private _selectionEnd: number = 0;

  // 포커스
  private _focused: boolean = false;

  // 제약
  private _maxLength: number = 100;
  private _allowedChars: RegExp | null = null;

  // 스타일
  private _focusedBorderColor: string = '#3498db';
  private _normalBorderColor: string = '#7f8c8d';
  private _focusedBackgroundColor: string = '#2c3e50';
  private _normalBackgroundColor: string = '#34495e';

  // 콜백
  private _onChange: TextChangeCallback | null = null;
  private _onSubmit: TextChangeCallback | null = null;
  private _onFocus: (() => void) | null = null;
  private _onBlur: (() => void) | null = null;

  // 숨겨진 HTML input 요소 (네이티브 IME 사용)
  private _hiddenInput: HTMLInputElement | null = null;

  constructor(name: string = 'InputBox') {
    super(name);

    // 숨겨진 input 요소 생성
    this.createHiddenInput();

    // 기본 스타일 설정
    this._borderWidth = 2;
    this._borderColor = this._normalBorderColor;
    this._backgroundColor = this._normalBackgroundColor;
    this._padding = 5;
  }

  /**
   * 숨겨진 input 요소 생성 (네이티브 IME 사용)
   */
  private createHiddenInput(): void {
    this._hiddenInput = document.createElement('input');
    this._hiddenInput.type = 'text';
    this._hiddenInput.style.position = 'absolute';
    this._hiddenInput.style.left = '-9999px';
    this._hiddenInput.style.top = '-9999px';
    this._hiddenInput.style.opacity = '0';
    this._hiddenInput.style.pointerEvents = 'none';
    document.body.appendChild(this._hiddenInput);

    // input 이벤트로 텍스트 변경 감지
    this._hiddenInput.addEventListener('input', () => {
      if (this._hiddenInput) {
        this._text = this._hiddenInput.value;
        // 커서 위치를 input의 selectionStart와 동기화
        this._cursorPosition = this._hiddenInput.selectionStart || this._text.length;

        if (this._onChange) {
          this._onChange(this._text);
        }
      }
    });

    // 키보드 이벤트 처리
    this._hiddenInput.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' && this._onSubmit) {
        this._onSubmit(this._text);
      }
    });

    // 커서 위치 변경 감지 (화살표 키, 클릭 등)
    this._hiddenInput.addEventListener('selectionchange', () => {
      if (this._hiddenInput) {
        this._cursorPosition = this._hiddenInput.selectionStart || this._text.length;
      }
    });

    // 별도로 keyup에서도 커서 위치 업데이트
    this._hiddenInput.addEventListener('keyup', () => {
      if (this._hiddenInput) {
        this._cursorPosition = this._hiddenInput.selectionStart || this._text.length;
      }
    });
  }

  /**
   * 텍스트
   */
  get text(): string {
    return this._text;
  }

  set text(value: string) {
    if (this._text === value) return;
    this._text = value;
    this._cursorPosition = Math.min(this._cursorPosition, this._text.length);

    if (this._onChange) {
      this._onChange(this._text);
    }
  }

  /**
   * 텍스트 설정
   */
  setText(text: string): void {
    this.text = text;
    // 숨겨진 input과 동기화
    if (this._hiddenInput) {
      this._hiddenInput.value = text;
    }
  }

  /**
   * 텍스트 반환
   */
  getText(): string {
    return this._text;
  }

  /**
   * Placeholder
   */
  get placeholder(): string {
    return this._placeholder;
  }

  set placeholder(value: string) {
    this._placeholder = value;
  }

  /**
   * Placeholder 설정
   */
  setPlaceholder(text: string): void {
    this._placeholder = text;
  }

  /**
   * 최대 길이
   */
  get maxLength(): number {
    return this._maxLength;
  }

  set maxLength(value: number) {
    this._maxLength = value;
  }

  /**
   * 최대 길이 설정
   */
  setMaxLength(length: number): void {
    this._maxLength = length;
  }

  /**
   * 허용 문자 패턴
   */
  get allowedChars(): RegExp | null {
    return this._allowedChars;
  }

  set allowedChars(value: RegExp | null) {
    this._allowedChars = value;
  }

  /**
   * 폰트
   */
  get font(): string {
    return this._font;
  }

  set font(value: string) {
    this._font = value;
  }

  /**
   * 텍스트 색상
   */
  get textColor(): string {
    return this._textColor;
  }

  set textColor(value: string) {
    this._textColor = value;
  }

  /**
   * Placeholder 색상
   */
  get placeholderColor(): string {
    return this._placeholderColor;
  }

  set placeholderColor(value: string) {
    this._placeholderColor = value;
  }

  /**
   * 포커스 상태
   */
  get focused(): boolean {
    return this._focused;
  }

  /**
   * onChange 콜백
   */
  set onChange(callback: TextChangeCallback | null) {
    this._onChange = callback;
  }

  /**
   * onSubmit 콜백 (Enter 키)
   */
  set onSubmit(callback: TextChangeCallback | null) {
    this._onSubmit = callback;
  }

  /**
   * onFocus 콜백
   */
  set onFocus(callback: (() => void) | null) {
    this._onFocus = callback;
  }

  /**
   * onBlur 콜백
   */
  set onBlur(callback: (() => void) | null) {
    this._onBlur = callback;
  }

  /**
   * 포커스 획득
   */
  focus(): void {
    if (this._focused) return;

    this._focused = true;
    this._cursorVisible = true;
    this._cursorBlinkTime = 0;
    this._borderColor = this._focusedBorderColor;
    this._backgroundColor = this._focusedBackgroundColor;

    // 숨겨진 input에 포커스하여 네이티브 IME 활성화
    if (this._hiddenInput) {
      this._hiddenInput.value = this._text;
      this._hiddenInput.focus();
    }

    if (this._onFocus) {
      this._onFocus();
    }
  }

  /**
   * 포커스 해제
   */
  blur(): void {
    if (!this._focused) return;

    this._focused = false;
    this._cursorVisible = false;
    this._borderColor = this._normalBorderColor;
    this._backgroundColor = this._normalBackgroundColor;

    // 숨겨진 input에서 포커스 제거
    if (this._hiddenInput) {
      this._hiddenInput.blur();
    }

    if (this._onBlur) {
      this._onBlur();
    }
  }

  /**
   * 클릭 시 포커스 획득
   */
  onClick(): void {
    // UIManager를 통해 포커스 설정
    // UIManager.setFocus(this) 호출은 UIManager에서 처리됨
  }

  /**
   * 문자 삽입
   * @param char 삽입할 문자
   */
  insertCharacter(char: string): void {
    if (this._text.length >= this._maxLength) {
      return; // 최대 길이 초과
    }

    // 허용 문자 필터링
    if (this._allowedChars && !this._allowedChars.test(char)) {
      return;
    }

    // 커서 위치에 문자 삽입
    const before = this._text.substring(0, this._cursorPosition);
    const after = this._text.substring(this._cursorPosition);
    this._text = before + char + after;
    this._cursorPosition++;

    // 커서 깜빡임 리셋
    this._cursorVisible = true;
    this._cursorBlinkTime = 0;

    if (this._onChange) {
      this._onChange(this._text);
    }
  }

  /**
   * 문자 삭제 (Backspace)
   */
  deleteCharacter(): void {
    if (this._cursorPosition === 0) {
      return; // 커서가 맨 앞이면 삭제 불가
    }

    // 커서 앞 문자 삭제
    const before = this._text.substring(0, this._cursorPosition - 1);
    const after = this._text.substring(this._cursorPosition);
    this._text = before + after;
    this._cursorPosition--;

    // 커서 깜빡임 리셋
    this._cursorVisible = true;
    this._cursorBlinkTime = 0;

    if (this._onChange) {
      this._onChange(this._text);
    }
  }

  /**
   * 커서 이동
   * @param direction 이동 방향 (-1: 왼쪽, 1: 오른쪽)
   */
  moveCursor(direction: number): void {
    this._cursorPosition = Math.max(
      0,
      Math.min(this._text.length, this._cursorPosition + direction)
    );

    // 커서 깜빡임 리셋
    this._cursorVisible = true;
    this._cursorBlinkTime = 0;
  }

  /**
   * Enter 키 처리 (제출)
   */
  submit(): void {
    if (this._onSubmit) {
      this._onSubmit(this._text);
    }
  }

  /**
   * 업데이트 (커서 깜빡임)
   * @param deltaTime 프레임 간 시간 (초 단위)
   */
  onUpdate(deltaTime: number): void {
    super.onUpdate(deltaTime);

    if (!this._focused) return;

    // 커서 깜빡임
    this._cursorBlinkTime += deltaTime;
    if (this._cursorBlinkTime >= this._cursorBlinkInterval) {
      this._cursorVisible = !this._cursorVisible;
      this._cursorBlinkTime = 0;
    }
  }

  /**
   * 렌더링
   * @param ctx Canvas 렌더링 컨텍스트
   */
  onRender(ctx: CanvasRenderingContext2D): void {
    ctx.save();

    // 투명도 적용
    ctx.globalAlpha = this._opacity;

    // 경계 영역 계산
    const bounds = this.getScreenBounds();

    // 배경 렌더링
    if (this._backgroundColor) {
      ctx.fillStyle = this._backgroundColor;
      ctx.fillRect(bounds.x, bounds.y, bounds.width, bounds.height);
    }

    // 테두리 렌더링
    if (this._borderColor && this._borderWidth > 0) {
      ctx.strokeStyle = this._borderColor;
      ctx.lineWidth = this._borderWidth;
      ctx.strokeRect(bounds.x, bounds.y, bounds.width, bounds.height);
    }

    // 텍스트 렌더링
    this.renderText(ctx, bounds);

    // 커서 렌더링 (포커스 시)
    if (this._focused && this._cursorVisible) {
      this.renderCursor(ctx, bounds);
    }

    ctx.restore();
  }

  /**
   * 텍스트 렌더링
   * @param ctx 렌더링 컨텍스트
   * @param bounds 경계 영역
   */
  private renderText(
    ctx: CanvasRenderingContext2D,
    bounds: { x: number; y: number; width: number; height: number }
  ): void {
    ctx.font = this._font;
    ctx.textAlign = 'left';
    ctx.textBaseline = 'middle';

    const textX = bounds.x + this._padding;
    const textY = bounds.y + bounds.height / 2;

    if (this._text.length > 0) {
      // 텍스트 표시
      ctx.fillStyle = this._textColor;
      ctx.fillText(this._text, textX, textY);
    } else if (this._placeholder) {
      // Placeholder 표시
      ctx.fillStyle = this._placeholderColor;
      ctx.fillText(this._placeholder, textX, textY);
    }
  }

  /**
   * 커서 렌더링
   * @param ctx 렌더링 컨텍스트
   * @param bounds 경계 영역
   */
  private renderCursor(
    ctx: CanvasRenderingContext2D,
    bounds: { x: number; y: number; width: number; height: number }
  ): void {
    ctx.font = this._font;

    // 커서 위치 계산
    const textBeforeCursor = this._text.substring(0, this._cursorPosition);
    const textWidth = ctx.measureText(textBeforeCursor).width;
    const cursorX = bounds.x + this._padding + textWidth;
    const cursorY1 = bounds.y + this._padding;
    const cursorY2 = bounds.y + bounds.height - this._padding;

    // 커서 그리기
    ctx.strokeStyle = this._cursorColor;
    ctx.lineWidth = this._cursorWidth;
    ctx.beginPath();
    ctx.moveTo(cursorX, cursorY1);
    ctx.lineTo(cursorX, cursorY2);
    ctx.stroke();
  }

  /**
   * 정리
   */
  destroy(): void {
    // 숨겨진 input 요소 제거
    if (this._hiddenInput && this._hiddenInput.parentNode) {
      this._hiddenInput.parentNode.removeChild(this._hiddenInput);
      this._hiddenInput = null;
    }

    super.destroy();
  }
}
