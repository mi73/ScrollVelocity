import $ from 'jquery';
import _ from 'underscore';
import velocity from 'velocity-animate';
import 'velocity-animate/velocity.ui';

/**
 * スクロール位置に応じてvelocity.jsを発火させるクラス
 * パラメータはマークアップで行う
 * マークアップできるパラメータは以下
 * data-effect プロパティーまたはエフェクト名
 * data-easing イージング
 * data-duration アニメーション時間
 * data-delay 遅延時間
 * data-bias 発火位置のバイアス値
 *
 * @example
 * new ScrollVelocity('.scrollVelocity');
 * <div class="scrollVelocity"
 *      data-effect='{"scale":[1, 0]}'
 *      data-easing="[250, 18]"
 *      data-duration="500"
 *      ata-delay="1600"
 *      data-bias="-1000">
 * <div class="scrollVelocity"
 *      data-effect='transition.transition.bounceLeftIn'
 *      data-easing="[250, 18]"
 *      data-duration="500"
 *      data-delay="1600"
 *      data-bias="-1000">
 */
export default class ScrollVelocity {

  /**
   * @param {String} selector 領域のセレクター
   * @param {Number} threshold 発火位置
   */
  constructor(selector, threshold = 400) {
    this.$elements = $(selector);
    this.elements = [];
    this.length = this.$elements.length;
    this.shownCount = 0;
    this.windowHeight = $(window).height();
    this.threshold = threshold;

    // offsetは取れるよう不可視状態にする
    _.each(this.$elements, (_element) => {
      const element = _element;
      element.style.opacity = 0;
    });

    $(window).on('load', () => {
      this.start();
    });
  }

  /**
   * パラメータを格納後、監視を開始する
   */
  start() {
    // パラメータを格納する
    _.each(this.$elements, (_element) => {
      const element = _element;
      const $this = $(element);
      element.isShown = false;
      element.delay = $this.data('delay') || 0;
      element.duration = $this.data('duration') || 800;
      element.easing = $this.data('easing') || [250, 20];
      element.bias = Number($this.data('bias')) || 0;
      element.property = $this.data('effect') || 'fadeIn';
      element.offsetY = $this.offset().top;
      this.elements.push(element);
    });

    this.scrollChecker();
    this.bind();
  }

  /**
   * 監視を開始する
   */
  bind() {
    $(window)
      .on('resize.ScrollVelocity', () => {
        this.resize();
      })
      .on('scroll.ScrollVelocity', () => {
        this.scrollChecker();
      });
  }

  /**
   * ウィンドウリサイズ時の処理
   */
  resize() {
    this.windowHeight = $(window).height();
    // オフセットを更新する
    _.each(this.elements, (_element) => {
      const element = _element;
      const $this = $(element);
      element.offsetY = $this.offset().top;
    });
  }

  /**
   * スクロール時に実行する
   */
  scrollChecker() {
    const scrollOffset = $(window).scrollTop();
    const threshold = (scrollOffset + this.windowHeight) - this.threshold;

    if (!this.allShown) {
      _.each(this.elements, (_element) => {
        const element = _element;
        // 位置を確認して表示する
        if (!element.isShown && threshold > element.offsetY + element.bias) {
          element.isShown = true;
          element.style.display = 'none';
          element.style.opacity = 1;

          velocity(element, element.property, {
            display: 'block',
            delay: element.delay,
            easing: element.easing,
            duration: element.duration,
          });

          this.shownCount += 1;

          // 全部表示したら、リスナーを止める
          if (this.shownCount === this.length) {
            this.allShown = true;
            $(window).off('scroll.ScrollVelocity resize.ScrollVelocity');
          }
        }
      });
    }
  }
}

