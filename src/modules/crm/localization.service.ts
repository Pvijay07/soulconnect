import { Injectable } from '@nestjs/common';

@Injectable()
export class LocalizationService {
    private readonly translations = {
        en: {
            welcome: 'Welcome to SoulConnect',
            payout_success: 'Your payout request has been submitted.',
            insufficient_balance: 'Insufficient balance in your wallet.',
        },
        hi: {
            welcome: 'सोलकनेक्ट में आपका स्वागत है',
            payout_success: 'आपका भुगतान अनुरोध सबमिट कर दिया गया है।',
            insufficient_balance: 'आपके वॉलेट में अपर्याप्त शेष राशि।',
        },
        bn: {
            welcome: 'SoulConnect অ্যাপে আপনাকে স্বাগতম',
            payout_success: 'আপনার পেআউট অনুরোধ জমা দেওয়া হয়েছে।',
            insufficient_balance: 'আপনার ওয়ালেটে পর্যাপ্ত ব্যালেন্স নেই।',
        },
        mr: {
            welcome: 'सोलकनेक्टमध्ये आपले स्वागत आहे',
            payout_success: 'तुमची पेआउट विनंती सबमिट केली गेली आहे.',
            insufficient_balance: 'तुमच्या वॉलेटमध्ये अपुरा बॅलन्स आहे.',
        },
    };

    /**
     * Translates a key based on language code
     */
    translate(key: string, lang: string = 'en'): string {
        const translations = this.translations[lang] || this.translations['en'];
        return translations[key] || key;
    }

    /**
     * Returns all available languages
     */
    getAvailableLanguages() {
        return [
            { code: 'en', name: 'English' },
            { code: 'hi', name: 'Hindi (हिंदी)' },
            { code: 'bn', name: 'Bengali (বাংলা)' },
            { code: 'mr', name: 'Marathi (मराठी)' },
            { code: 'ta', name: 'Tamil (தமிழ்)' },
            { code: 'te', name: 'Telugu (తెలుగు)' },
        ];
    }
}
