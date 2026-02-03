import { UIElement } from './UIElement';
import type {
  TextAlign,
  VerticalAlign,
  TextShadow,
  TextOutline,
} from './types';

/**
 * Label 클래스
 * 텍스트를 렌더링하는 UI 요소입니다.
 */
export class Label extends UIElement {
  // 텍스트 속성
  private _text: string = '';
  private _font: string = '16px Arial';
  private _textColor: string = '#ffffff';
  private _textAlign: TextAlign = 'center';
  private _verticalAlign: VerticalAlign = 'middle';
  private _lineHeight: number = 1.2;
  private _maxWidth: number | null = null; // 자동 줄바꿈

  // 스타일 (옵션)
  private _textShadow: TextShadow | null = null;
  private _outline: TextOutline | null = null;

  // 캐싱
  private _cachedTextSize: { width: number; height: number } | null = null;
  private _textDirty: boolean = true;

  constructor(name: string = 'Label') {
    super(name);
    this._interactive = false; // 기본적으로 Label은 클릭 불가
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
    this._textDirty = true;
  }

  /**
   * 텍스트 설정 (메서드)
   */
  setText(text: string): void {
    this.text = text;
  }

  /**
   * 폰트
   */
  get font(): string {
    return this._font;
  }

  set font(value: string) {
    if (this._font === value) return;
    this._font = value;
    this._textDirty = true;
  }

  /**
   * 폰트 설정 (메서드)
   * @param size 폰트 크기 (픽셀)
   * @param family 폰트 패밀리 (기본값: Arial)
   */
  setFont(size: number, family: string = 'Arial'): void {
    this.font = `${size}px ${family}`;
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
   * 텍스트 정렬
   */
  get textAlign(): TextAlign {
    return this._textAlign;
  }

  set textAlign(value: TextAlign) {
    this._textAlign = value;
  }

  /**
   * 수직 정렬
   */
  get verticalAlign(): VerticalAlign {
    return this._verticalAlign;
  }

  set verticalAlign(value: VerticalAlign) {
    this._verticalAlign = value;
  }

  /**
   * 줄 간격
   */
  get lineHeight(): number {
    return this._lineHeight;
  }

  set lineHeight(value: number) {
    this._lineHeight = value;
  }

  /**
   * 최대 너비 (자동 줄바꿈)
   */
  get maxWidth(): number | null {
    return this._maxWidth;
  }

  set maxWidth(value: number | null) {
    if (this._maxWidth === value) return;
    this._maxWidth = value;
    this._textDirty = true;
  }

  /**
   * 텍스트 그림자
   */
  get textShadow(): TextShadow | null {
    return this._textShadow;
  }

  set textShadow(value: TextShadow | null) {
    this._textShadow = value;
  }

  /**
   * 텍스트 외곽선
   */
  get outline(): TextOutline | null {
    return this._outline;
  }

  set outline(value: TextOutline | null) {
    this._outline = value;
  }

  /**
   * 텍스트 크기 계산 (캐싱 지원)
   * @returns 텍스트의 너비와 높이
   */
  calculateTextSize(): { width: number; height: number } {
    if (!this._textDirty && this._cachedTextSize) {
      return this._cachedTextSize;
    }

    // Engine의 ctx를 가져옴
    const ctx = this.scene?.engine?.ctx;
    if (!ctx) {
      return { width: 0, height: 0 };
    }

    ctx.save();
    ctx.font = this._font;

    // 텍스트 너비 측정
    const lines = this.wrapText(ctx);
    let maxWidth = 0;
    for (const line of lines) {
      const metrics = ctx.measureText(line);
      maxWidth = Math.max(maxWidth, metrics.width);
    }

    // 폰트 크기 추출 (높이 계산)
    const fontSize = parseInt(this._font);
    const lineHeightPx = fontSize * this._lineHeight;
    const totalHeight = lineHeightPx * lines.length;

    ctx.restore();

    this._cachedTextSize = {
      width: maxWidth,
      height: totalHeight,
    };
    this._textDirty = false;

    return this._cachedTextSize;
  }

  /**
   * 텍스트 줄바꿈 처리
   * @param ctx 렌더링 컨텍스트
   * @returns 줄바꿈된 텍스트 배열
   */
  private wrapText(ctx: CanvasRenderingContext2D): string[] {
    if (!this._maxWidth) {
      // maxWidth가 없으면 줄바꿈 안 함
      return this._text.split('\n'); // 단, 명시적 줄바꿈(\n)은 지원
    }

    const lines: string[] = [];
    const paragraphs = this._text.split('\n');

    for (const paragraph of paragraphs) {
      const words = paragraph.split(' ');
      let currentLine = '';

      for (const word of words) {
        const testLine = currentLine ? `${currentLine} ${word}` : word;
        const metrics = ctx.measureText(testLine);

        if (metrics.width > this._maxWidth && currentLine) {
          // 현재 줄이 maxWidth를 초과하면 줄바꿈
          lines.push(currentLine);
          currentLine = word;
        } else {
          currentLine = testLine;
        }
      }

      if (currentLine) {
        lines.push(currentLine);
      }
    }

    return lines;
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

    // 배경색 렌더링
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
    if (this._text) {
      ctx.font = this._font;
      ctx.fillStyle = this._textColor;

      // 텍스트 그림자 설정
      if (this._textShadow) {
        ctx.shadowColor = this._textShadow.color;
        ctx.shadowOffsetX = this._textShadow.offsetX;
        ctx.shadowOffsetY = this._textShadow.offsetY;
        ctx.shadowBlur = this._textShadow.blur;
      }

      // 줄바꿈된 텍스트 가져오기
      const lines = this.wrapText(ctx);
      const fontSize = parseInt(this._font);
      const lineHeightPx = fontSize * this._lineHeight;

      // 수직 정렬 계산
      const totalTextHeight = lineHeightPx * lines.length;
      let startY = bounds.y;

      if (this._verticalAlign === 'middle') {
        startY = bounds.y + (bounds.height - totalTextHeight) / 2 + fontSize;
      } else if (this._verticalAlign === 'bottom') {
        startY = bounds.y + bounds.height - totalTextHeight + fontSize;
      } else {
        // top
        startY = bounds.y + fontSize;
      }

      // 각 줄 렌더링
      for (let i = 0; i < lines.length; i++) {
        const line = lines[i];
        const y = startY + i * lineHeightPx;

        // 수평 정렬 계산
        let x = bounds.x;
        if (this._textAlign === 'center') {
          x = bounds.x + bounds.width / 2;
          ctx.textAlign = 'center';
        } else if (this._textAlign === 'right') {
          x = bounds.x + bounds.width;
          ctx.textAlign = 'right';
        } else {
          // left
          ctx.textAlign = 'left';
        }

        // 외곽선 렌더링 (있으면)
        if (this._outline) {
          ctx.strokeStyle = this._outline.color;
          ctx.lineWidth = this._outline.width;
          ctx.strokeText(line, x, y);
        }

        // 텍스트 렌더링
        ctx.fillText(line, x, y);
      }
    }

    ctx.restore();
  }
}
