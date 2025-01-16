import jsPDF from 'jspdf';
import domtoimage from 'dom-to-image';

const A4 = {
  width: 595,
  height: 842,
} as const;

/**
 * get a4 height
 * @param width width
 * @returns a4 height
 */
const getA4Height = (width: number): number => {
  return Math.floor((A4.height * width) / A4.width);
};

/**
 * get element box height
 * @param element element
 * @returns box height
 */
const getBoxHeight = (element: HTMLElement): number => {
  const rect = element.getBoundingClientRect();
  const styles = window.getComputedStyle(element);
  const margins = parseFloat(styles.marginTop) + parseFloat(styles.marginBottom);
  return Math.ceil(rect.height + margins);
};

const runTask = async (taskQueue: (() => void)[]): Promise<void> => {
  return new Promise((resolve) => {
    const runNextTask = () => {
      requestIdleCallback((deadline) => {
        while (!deadline.didTimeout && deadline.timeRemaining() > 0 && taskQueue.length > 0) {
          const task = taskQueue.pop();
          task?.();
        }
        if (taskQueue.length > 0) {
          runNextTask();
        } else {
          resolve();
        }
      });
    };

    runNextTask();
  });
};

const createBlank = (height: number): HTMLDivElement => {
  const blank = document.createElement('div');
  blank.style.height = `${height}px`;
  return blank;
};

/**
 * create a page wrapper with padding-top
 * @param padding page padding
 * @param className page wrapper class name
 * @returns page wrapper
 */
const createWrapper = (
  height: number,
  padding: number,
  className: string = 'page_wrapper'
): HTMLDivElement => {
  const wrapper = document.createElement('div');
  wrapper.style.height = `${height}px`;
  wrapper.appendChild(createBlank(padding));
  wrapper.classList.add(className);
  return wrapper;
};

/**
 * adjust layout
 * collection all units -> determine whether it can be placed on one page「a4」 -> wrappers.
 * top-down streaming.
 * @param ele container selector or element
 * @param unitSelector unit selector
 * @param pageWrapperClass page wrapper class name
 * @param py page padding
 */
const _adjustLayout = async (
  ele: HTMLElement | string,
  unitSelector: string,
  pageWrapperClass: string = 'page_wrapper',
  py: number = 20
): Promise<void> => {
  /* get all units */
  const units = document.querySelectorAll<HTMLElement>(unitSelector);
  if (!units.length) throw new Error('No units found');

  /* get container */
  const container = typeof ele === 'string' ? document.querySelector<HTMLElement>(ele) : ele;
  if (!container) throw new Error('No container found');

  /* container w/h -> a4 w/h */
  const a4Width = container.clientWidth;
  const a4Height = getA4Height(a4Width);

  /* current pointer position */
  let cur = 0;
  /* create first page wrapper */
  let wrapper = createWrapper(a4Height, py, pageWrapperClass);
  /* page wrappers */
  const wrappers: HTMLDivElement[] = [];
  cur += py;

  /* top-down streaming */
  for (let i = 0; i < units.length; i++) {
    const unit = units[i];
    const boxHeight = getBoxHeight(unit);
    const restHeight = a4Height - (cur % a4Height);

    /* restHeight not enough for padding */
    if (restHeight - boxHeight < py) {
      wrapper.appendChild(createBlank(restHeight));
      cur += restHeight;

      /* push current page */
      wrappers.push(wrapper.cloneNode(true) as HTMLDivElement);

      /* gen new page & fill padding & unit to next page */
      wrapper = createWrapper(a4Height, py, pageWrapperClass);
      cur += py;
      wrapper.appendChild(unit.cloneNode(true));
      cur += boxHeight;
    } else {
      wrapper.appendChild(unit.cloneNode(true));
      cur += boxHeight;
    }

    /* last page */
    if (i === units.length - 1) {
      wrappers.push(wrapper.cloneNode(true) as HTMLDivElement);
    }
  }

  /* clear container */
  container.innerHTML = '';

  const taskQueue = wrappers.map((wrapper) => () => container.appendChild(wrapper)).reverse();
  await runTask(taskQueue);
};

/**
 * transfer html to pdf
 * collection all wrappers -> images -> pdf.
 * @param ele container selector or element
 * @param unitSelector unit selector
 * @param pageWrapperClass page wrapper class name
 * @param py page padding
 * @example transfer2Pdf('.container', '.min_unit', 'page_wrapper', 20)
 */
export const transfer2Pdf = async (
  ele: HTMLElement | string,
  unitSelector: string,
  pageWrapperClass: string = 'page_wrapper',
  py: number = 20
): Promise<void> => {
  try {
    /* adjust layout */
    await _adjustLayout(ele, unitSelector, pageWrapperClass, py);

    const pages = document.querySelectorAll<HTMLElement>(`.${pageWrapperClass}`);
    if (!pages.length) throw new Error('No pages found');

    /* create pdf instance */
    const pdf = new jsPDF('p', 'pt', 'a4');

    /* convert each page to image and add to pdf */
    for (let i = 0; i < pages.length; i++) {
      if (i > 0) pdf.addPage();

      /* dom to image */
      const imgData = await domtoimage.toPng(pages[i]);

      /* add image to pdf */
      pdf.addImage(imgData, 'PNG', 0, 0, A4.width, A4.height);
    }

    /* save pdf */
    pdf.save('document.pdf');
  } catch (error) {
    console.error('pdf generation failed:', error);
    throw error;
  }
};
