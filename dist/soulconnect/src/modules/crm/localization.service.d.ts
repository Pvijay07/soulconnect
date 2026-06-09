export declare class LocalizationService {
    private readonly translations;
    translate(key: string, lang?: string): string;
    getAvailableLanguages(): {
        code: string;
        name: string;
    }[];
}
