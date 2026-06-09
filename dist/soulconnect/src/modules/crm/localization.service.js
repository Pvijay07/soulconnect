"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.LocalizationService = void 0;
const common_1 = require("@nestjs/common");
let LocalizationService = class LocalizationService {
    translations = {
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
    translate(key, lang = 'en') {
        const translations = this.translations[lang] || this.translations['en'];
        return translations[key] || key;
    }
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
};
exports.LocalizationService = LocalizationService;
exports.LocalizationService = LocalizationService = __decorate([
    (0, common_1.Injectable)()
], LocalizationService);
//# sourceMappingURL=localization.service.js.map