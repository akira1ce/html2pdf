# html2pdf

HTML -> layout -> image -> PDF。

**主要的问题在于，分页的切割拆分**。

适用于：自定义渲染出来的报告页面，可手动标记某些节点，以便于分页。

## type

```ts
/**
 * transfer html to pdf
 * collection all wrappers -> images -> pdf.
 * @param ele container selector or element
 * @param unitSelector unit selector
 * @param pageWrapperClass page wrapper class name
 * @param py page padding
 * @example transfer2Pdf('.container', '.min_unit', 'page_wrapper', 20)
 */
export declare const transfer2Pdf: (ele: HTMLElement | string, unitSelector: string, pageWrapperClass?: string, py?: number) => Promise<void>;

```

## 示例

**注意：**

1. 需要标记单元节点。
2. 容器需要定宽。

```jsx
import { transfer2Pdf } from '@akira1ce/html2pdf';

export default function App() {
  return <>
    <button onClick={() => transfer2Pdf('.container', '.min_unit')}> transfer2Pdf </button>
    {/* 容器 */}
    <div className="container" style={{width: 794}}>
      {/* 单元节点 */}
      <div className="min_unit"> Hello, world! </div>
      <div className="min_unit">Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat.</div>
      
      <div className="min_unit">Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum.</div>
      
      <div className="min_unit">Section 1</div>
      <div className="min_unit">Sed ut perspiciatis unde omnis iste natus error sit voluptatem accusantium doloremque laudantium, totam rem aperiam, eaque ipsa quae ab illo inventore veritatis et quasi architecto beatae vitae dicta sunt explicabo.</div>
      
      <div className="min_unit">Section 2</div>
      <div className="min_unit">Nemo enim ipsam voluptatem quia voluptas sit aspernatur aut odit aut fugit, sed quia consequuntur magni dolores eos qui ratione voluptatem sequi nesciunt. Neque porro quisquam est, qui dolorem ipsum quia dolor sit amet.</div>
    </div>
  </>
}

```

## 核心原理

核心在与布局的调整，我们需要**收集所有的单元节点**「因此需要手动给页面单元节点打上标记」，然后遍历所有单元，根据 A4 纸张的尺寸，根据单元高度**自上而下**重新调整单元节点。

将单页放不下的节点移至下一页，并将上一页的节点收集到一个新的div中「带特殊标记」，直到所有节点都放置完毕。

最后遍历每一页，生成图片，并添加到 PDF 中。

## 核心依赖

- [dom-to-image](https://github.com/tsayen/dom-to-image)
- [jspdf](https://github.com/MrRio/jsPDF)
