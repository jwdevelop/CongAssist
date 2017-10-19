import { CongAssistPage } from './app.po';

describe('cong-assist App', () => {
  let page: CongAssistPage;

  beforeEach(() => {
    page = new CongAssistPage();
  });

  it('should display welcome message', () => {
    page.navigateTo();
    expect(page.getParagraphText()).toEqual('Welcome to app!!');
  });
});
