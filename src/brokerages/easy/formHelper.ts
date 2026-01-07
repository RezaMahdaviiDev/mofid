import { Page } from 'playwright';

/**
 * Clear کردن فیلدهای فرم خرید
 */
export async function clearFormFields(page: Page): Promise<void> {
  try {
    // Clear کردن فیلد قیمت
    const priceInput = page.locator("[data-cy='order-form-input-price']");
    if (await priceInput.isVisible().catch(() => false)) {
      await priceInput.clear();
      await priceInput.fill('');
      await page.waitForTimeout(50);
    }

    // Clear کردن فیلد تعداد
    const quantityInput = page.locator("[data-cy='order-form-input-quantity']");
    if (await quantityInput.isVisible().catch(() => false)) {
      await quantityInput.clear();
      await quantityInput.fill('');
      await page.waitForTimeout(50);
    }
  } catch (error) {
    console.warn('⚠️ خطا در clear کردن فیلدها:', error);
  }
}

/**
 * تایید مقادیر فرم خرید
 */
export async function verifyFormValues(
  page: Page, 
  expectedPrice: string, 
  expectedQuantity: string
): Promise<{ isValid: boolean; actualPrice: string; actualQuantity: string }> {
  try {
    const actualPrice = await page.locator("[data-cy='order-form-input-price']").inputValue().catch(() => '');
    const actualQuantity = await page.locator("[data-cy='order-form-input-quantity']").inputValue().catch(() => '');

    const isValid = actualPrice === expectedPrice && actualQuantity === expectedQuantity;

    if (!isValid) {
      console.warn(`⚠️ مقادیر تطابق ندارند!`);
      console.warn(`  Expected: قیمت=${expectedPrice}, تعداد=${expectedQuantity}`);
      console.warn(`  Actual: قیمت=${actualPrice}, تعداد=${actualQuantity}`);
    } else {
      console.log(`✅ مقادیر تایید شد: قیمت=${actualPrice}, تعداد=${actualQuantity}`);
    }

    return { isValid, actualPrice, actualQuantity };
  } catch (error) {
    console.warn('⚠️ خطا در تایید مقادیر:', error);
    return { isValid: false, actualPrice: '', actualQuantity: '' };
  }
}



