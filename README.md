# html2pdf

HTML -> layout -> image -> PDF。

**主要的问题在于，分页的切割拆分**。

适用于：自定义渲染出来的报告页面，可手动标记某些节点，以便于分页。

# 使用

`yarn add @types/dom-to-image dom-to-image jspdf`

1. 标记单元节点。
2. copy html2pdf.ts。
3. 事件中调用 `transfer2Pdf` 方法。

# 核心原理

核心在与布局的调整，我们需要**收集所有的单元节点**「因此需要手动给页面单元节点打上标记」，然后遍历所有单元，根据 A4 纸张的尺寸，根据单元高度**自上而下**重新调整单元节点。

将单页放不下的节点移至下一页，并将上一页的节点收集到一个新的div中「带特殊标记」，直到所有节点都放置完毕。

最后遍历每一页，生成图片，并添加到 PDF 中。

# 核心依赖

- [dom-to-image](https://github.com/tsayen/dom-to-image)
- [jspdf](https://github.com/MrRio/jsPDF)
