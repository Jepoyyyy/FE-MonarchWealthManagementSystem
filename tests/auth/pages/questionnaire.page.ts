import type { Page, Locator } from '@playwright/test';

export class QuestionnairePage {
  readonly page: Page;
  readonly nextButton: Locator;
  readonly seeProfileButton: Locator;

  constructor(page: Page) {
    this.page = page;
    this.nextButton = page.getByRole('button', { name: /next question/i });
    this.seeProfileButton = page.getByRole('button', { name: /see my profile/i });
  }

  async selectOptionByText(text: string | RegExp) {
    await this.page.getByText(text).click();
  }

  async selectOptionByIndex(index: number = 0) {
    const options = this.page.locator('button.w-full.text-left');
    await options.nth(index).click();
  }

  async clickNext() {
    if (await this.seeProfileButton.isVisible().catch(() => false)) {
      await this.seeProfileButton.click();
    } else {
      await this.nextButton.click();
    }
  }

  async completeAllQuestions(answers: string[]) {
    for (let i = 0; i < answers.length; i++) {
      await this.selectOptionByText(answers[i]);
      await this.clickNext();
    }
  }

  async completeWithDefaultAnswers(totalQuestions: number = 5) {
    for (let i = 0; i < totalQuestions; i++) {
      await this.selectOptionByIndex(0);
      await this.clickNext();
    }
  }

  async waitForResults() {
    await this.page.getByText(/risk profile|assessment complete|conservative|moderate|aggressive/i)
      .waitFor({ state: 'visible', timeout: 10000 });
  }
}
