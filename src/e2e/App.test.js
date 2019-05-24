import puppeteer from 'puppeteer';

let browser, page;
beforeAll(async () => {
  browser = await puppeteer.launch({
    headless: false,
    slowMo: 80,
    devtools: true,
  });
});

beforeEach (async () => {
  page = await browser.newPage();
});

afterEach (async () => {
  await page.close();
});

afterAll(() => {
  browser.close();
});

describe('init correctly', () => {
  test( 'renders upper texts correctly', async () => {
    await page.goto('http://0.0.0.0:3000');
    const headerText = await page.$eval('h1', e => e.innerText);
    const pText = await page.$eval('p', e => e.innerText);

    expect(headerText).toEqual('Highlight Text');
    expect(pText).toEqual('Highlight selected text');
  }, 16000);

  test('renders editor with some text', async () => {
    await page.goto('http://0.0.0.0:3000');
    const editorText = await page.$eval('.editor', e => e.innerText);
    expect(editorText).toBeTruthy();
  }, 16000);

  test('renders editor with some text different from placeholder after loading from api', async (done) => {
    await page.goto('http://0.0.0.0:3000');

    await page.on('response', async (response) => {
      if (response.url() === 'https://api.adviceslip.com/advice') {
        let editorText = await page.$eval('.editor', e => e.innerText.trim()); //$eval?
        expect(editorText).not.toBe('Type something to start highlighting');
        done();
      }
    });
  }, 16000);
});

describe('simple click events work as expected', () => {
  test('text updates after clicking on reset', async (done) => {
    await page.goto('http://0.0.0.0:3000');

    let initialText, secondText;
    await page.on('response', async (response) => {
      if (response.url() === 'https://api.adviceslip.com/advice') {
        if (initialText === undefined) {
          initialText = await page.$eval('.editor', e => e.innerText.trim());
          expect(initialText).not.toBe('Type something to start highlighting');

          const button = await page.$('button');
          await button.click();
        } else {
          secondText = await page.$eval('.editor', e => e.innerText.trim());
          expect(secondText).not.toBe(initialText);
          done();
        }
      }
    });
  }, 16000);

  test('after clicking on editor, should focus on content editable div', async () => {
    await page.goto('http://0.0.0.0:3000');

    const editor = await page.$('[contenteditable]')
    await editor.focus();

    const isContentEditableActive = await page.evaluate(async () => {
      return document.activeElement.contentEditable;
    });

    // document.activeElement.contentEditable returns true as string
    expect(isContentEditableActive).toBe("true");
  }, 16000);
});

describe('select text should provide a toolbar and should be able to highlight the selected text', () => {
  test('should be able to select text and see a toolbar', async (done) => {
    await page.goto('http://0.0.0.0:3000');
  
    const editor = await page.$('.DraftEditor-editorContainer')
    await editor.click();
    await editor.click({ clickCount: 3 });

    await setTimeout(async () => {
      const toolbar = await page.$('.toolbar');
      expect(toolbar).toBeTruthy();
      done();
    }, 500)
  }, 16000);

  test('should be able to select text highlight it', async (done) => {
    await page.goto('http://0.0.0.0:3000');
  
    const editor = await page.$('.DraftEditor-editorContainer')
    await editor.click();
    await editor.click({ clickCount: 3 });

    await setTimeout(async () => {
      const styleButton = await page.$('.toolbar span');
      await styleButton.click();

      const coloredSpan = await page.$('span[data-offset-key][style]:not([style=""])');
      expect(coloredSpan).toBeTruthy();

      done();
    }, 500)
  }, 16000);

  test('should be able to reset highlighted texts', async (done) => {
    await page.goto('http://0.0.0.0:3000');
  
    const editor = await page.$('.DraftEditor-editorContainer')
    await editor.click();
    await editor.click({ clickCount: 3 });
  
    await setTimeout(async () => {
      const styleButton = await page.$('.toolbar span:nth-child(2)');
      await styleButton.click();
      
      let coloredSpan = await page.$('span[data-offset-key][style]:not([style=""])');
      expect(coloredSpan).toBeTruthy();

      const resetButton = await page.$('button');
      await resetButton.click();

      await page.on('response', async (response) => {
        if (response.url() === 'https://api.adviceslip.com/advice') {
          coloredSpan = await page.$('span[data-offset-key][style]:not([style=""])');
          expect(coloredSpan).toBeFalsy();
          done();
        }
      });
    }, 500)
  }, 16000);

  test('should be able to list highlighted texts', async (done) => {
    await page.goto('http://0.0.0.0:3000');
  
    const editor = await page.$('.DraftEditor-editorContainer')
    await editor.click();
    await editor.click({ clickCount: 3 });
  
    await setTimeout(async () => {
      const styleButton = await page.$('.toolbar span:nth-child(3)');
      await styleButton.click();
      
      const highlightedTextList = await page.$('.highlighted-list');
      expect(highlightedTextList).toBeTruthy();
      done();

    }, 500)
  }, 16000);
});

