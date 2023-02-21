import { BaseApiResponse } from '../dtos';

export abstract class AbstractController {
  protected async response<V>(
    raw: Promise<V> | V,
    meta: Record<string, unknown> = {},
  ): Promise<BaseApiResponse<V>> {
    if (raw instanceof Promise) {
      return {
        data: await raw,
        meta: meta,
      };
    }
    return {
      data: raw,
      meta: meta,
    };
  }
}
