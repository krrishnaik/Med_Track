/**
 * translations.ts  — pure data + hooks only, NO JSX
 * For the dropdown component, import LanguageSelector from ./LanguageSelector.tsx
 */
"use client";
import { useState, useCallback } from "react";

export type Lang = "en" | "hi" | "mr" | "bn" | "ta" | "te" | "gu";

export const LANGUAGE_OPTIONS: { code: Lang; label: string; nativeLabel: string }[] = [
    { code: "en", label: "English", nativeLabel: "English" },
    { code: "hi", label: "Hindi", nativeLabel: "हिंदी" },
    { code: "mr", label: "Marathi", nativeLabel: "मराठी" },
    { code: "bn", label: "Bengali", nativeLabel: "বাংলা" },
    { code: "ta", label: "Tamil", nativeLabel: "தமிழ்" },
    { code: "te", label: "Telugu", nativeLabel: "తెలుగు" },
    { code: "gu", label: "Gujarati", nativeLabel: "ગુજરાતી" },
];

// All string keys used in the UI
type Key =
    | "appName" | "tagline" | "disclaimer"
    | "patientMedications" | "loadDemo" | "drugsEntered" | "cascadeActive" | "addMore"
    | "drugNamePlaceholder" | "dosePlaceholder" | "selectSpecialist" | "addAnotherDrug"
    | "patientContext" | "age" | "agePlaceholder" | "egfr" | "egfrPlaceholder"
    | "allergies" | "allergiesPlaceholder"
    | "analyze" | "analyzing" | "copyReport" | "copied" | "exportPDF"
    | "overallRisk" | "cascadePaths" | "pairwiseInteractions"
    | "cascadeFingerprint" | "enzymeNetwork" | "cascadeDrug" | "safeDrug"
    | "cascadePath" | "particleNote" | "cascadeDetected"
    | "riskScore" | "inhibitors" | "affected" | "inducers"
    | "evidenceGrade" | "interactionType"
    | "pairwiseTitle" | "mechanism" | "effect" | "management" | "alternative" | "fullReport"
    | "patientRiskFactors" | "riskSummary"
    | "emptyTitle" | "emptySubtitle"
    | "cardiologist" | "endocrinologist" | "rheumatologist" | "psychiatrist"
    | "neurologist" | "pulmonologist" | "gastroenterologist" | "gp" | "other"
    | "uploadPrescription" | "readingPrescription" | "drugsFound" | "uploadError";

const en: Record<Key, string> = {
    appName: "Cascade", tagline: "Multi-drug cascade interaction checker",
    disclaimer: "Clinical decision support only — not a substitute for pharmacist review",
    patientMedications: "Patient medications", loadDemo: "Load demo ↗",
    drugsEntered: "drug(s) entered", cascadeActive: "✓ cascade detection active",
    addMore: "— add 3+ for cascade analysis",
    drugNamePlaceholder: "Drug name (e.g. metoprolol)", dosePlaceholder: "Dose",
    selectSpecialist: "Select prescribing specialist", addAnotherDrug: "+ Add another drug",
    patientContext: "Patient context", age: "Age", agePlaceholder: "e.g. 68",
    egfr: "eGFR (renal fn)", egfrPlaceholder: "e.g. 55",
    allergies: "Known allergies (comma-separated)", allergiesPlaceholder: "e.g. penicillin, sulfa",
    analyze: "Analyze interaction cascade", analyzing: "Analyzing cascade risks...",
    copyReport: "Copy report", copied: "Copied ✓", exportPDF: "Export PDF",
    overallRisk: "Overall risk level",
    cascadePaths: "cascade path(s)", pairwiseInteractions: "pairwise interaction(s)",
    cascadeFingerprint: "Cascade Fingerprint™", enzymeNetwork: "enzyme interaction network",
    cascadeDrug: "Cascade drug", safeDrug: "Safe drug",
    cascadePath: "Cascade path", particleNote: "particles = risk flowing through enzyme",
    cascadeDetected: "⚠ Cascade interactions detected — invisible to pairwise checkers",
    riskScore: "risk score", inhibitors: "Inhibitors", affected: "Affected", inducers: "Inducers",
    evidenceGrade: "Evidence grade", interactionType: "Type",
    pairwiseTitle: "Pairwise interactions", mechanism: "Mechanism", effect: "Effect",
    management: "Management", alternative: "Alternative", fullReport: "Full clinical report",
    patientRiskFactors: "Patient risk factors", riskSummary: "Risk summary",
    emptyTitle: "Enter a patient's full medication list to reveal hidden cascade interaction risks.",
    emptySubtitle: "Click \"Load demo ↗\" for a pre-filled example showing a CRITICAL cascade.",
    cardiologist: "Cardiologist", endocrinologist: "Endocrinologist",
    rheumatologist: "Rheumatologist", psychiatrist: "Psychiatrist",
    neurologist: "Neurologist", pulmonologist: "Pulmonologist",
    gastroenterologist: "Gastroenterologist", gp: "General Practitioner", other: "Other",
    uploadPrescription: "Upload prescription photo",
    readingPrescription: "Reading prescription...",
    drugsFound: "drug(s) found in prescription",
    uploadError: "Could not read prescription. Please enter drugs manually.",
};

const hi: Record<Key, string> = {
    appName: "Cascade", tagline: "बहु-दवा कैस्केड इंटरेक्शन चेकर",
    disclaimer: "केवल नैदानिक निर्णय समर्थन — फार्मासिस्ट की सलाह का विकल्प नहीं",
    patientMedications: "रोगी की दवाएं", loadDemo: "डेमो लोड करें ↗",
    drugsEntered: "दवा/दवाएं दर्ज की गईं", cascadeActive: "✓ कैस्केड डिटेक्शन सक्रिय",
    addMore: "— कैस्केड विश्लेषण के लिए 3+ दवाएं जोड़ें",
    drugNamePlaceholder: "दवा का नाम (जैसे मेटोप्रोलोल)", dosePlaceholder: "खुराक",
    selectSpecialist: "विशेषज्ञ चुनें", addAnotherDrug: "+ एक और दवा जोड़ें",
    patientContext: "रोगी की जानकारी", age: "आयु", agePlaceholder: "जैसे 68",
    egfr: "eGFR (गुर्दे की कार्यक्षमता)", egfrPlaceholder: "जैसे 55",
    allergies: "ज्ञात एलर्जी (अल्पविराम से अलग करें)", allergiesPlaceholder: "जैसे पेनिसिलिन, सल्फा",
    analyze: "इंटरेक्शन कैस्केड विश्लेषण करें", analyzing: "कैस्केड जोखिम का विश्लेषण हो रहा है...",
    copyReport: "रिपोर्ट कॉपी करें", copied: "कॉपी हो गई ✓", exportPDF: "PDF निर्यात करें",
    overallRisk: "कुल जोखिम स्तर",
    cascadePaths: "कैस्केड पथ", pairwiseInteractions: "जोड़ीवार इंटरेक्शन",
    cascadeFingerprint: "कैस्केड फिंगरप्रिंट™", enzymeNetwork: "एंजाइम इंटरेक्शन नेटवर्क",
    cascadeDrug: "कैस्केड दवा", safeDrug: "सुरक्षित दवा",
    cascadePath: "कैस्केड पथ", particleNote: "चलते बिंदु = एंजाइम के माध्यम से जोखिम प्रवाह",
    cascadeDetected: "⚠ कैस्केड इंटरेक्शन मिली — जोड़ी-जांच में नहीं दिखती",
    riskScore: "जोखिम स्कोर", inhibitors: "अवरोधक", affected: "प्रभावित", inducers: "प्रेरक",
    evidenceGrade: "साक्ष्य स्तर", interactionType: "प्रकार",
    pairwiseTitle: "जोड़ीवार इंटरेक्शन", mechanism: "तंत्र", effect: "प्रभाव",
    management: "प्रबंधन", alternative: "विकल्प", fullReport: "पूर्ण नैदानिक रिपोर्ट",
    patientRiskFactors: "रोगी जोखिम कारक", riskSummary: "जोखिम सारांश",
    emptyTitle: "छिपे हुए कैस्केड जोखिमों को उजागर करने के लिए रोगी की पूरी दवा सूची दर्ज करें।",
    emptySubtitle: "CRITICAL कैस्केड दिखाने वाले उदाहरण के लिए \"डेमो लोड करें\" पर क्लिक करें।",
    cardiologist: "हृदय रोग विशेषज्ञ", endocrinologist: "अंतःस्रावी विशेषज्ञ",
    rheumatologist: "संधि रोग विशेषज्ञ", psychiatrist: "मनोचिकित्सक",
    neurologist: "तंत्रिका विशेषज्ञ", pulmonologist: "फेफड़े विशेषज्ञ",
    gastroenterologist: "पाचन तंत्र विशेषज्ञ", gp: "सामान्य चिकित्सक", other: "अन्य",
    uploadPrescription: "प्रिस्क्रिप्शन फोटो अपलोड करें",
    readingPrescription: "प्रिस्क्रिप्शन पढ़ी जा रही है...",
    drugsFound: "दवा/दवाएं प्रिस्क्रिप्शन में मिलीं",
    uploadError: "प्रिस्क्रिप्शन पढ़ नहीं सकी। कृपया दवाएं मैन्युअल रूप से दर्ज करें।",
};

const mr: Record<Key, string> = {
    appName: "Cascade", tagline: "बहु-औषध कॅस्केड इंटरॅक्शन तपासक",
    disclaimer: "केवल क्लिनिकल निर्णय समर्थन — फार्मासिस्टच्या सल्ल्याचा पर्याय नाही",
    patientMedications: "रुग्णाची औषधे", loadDemo: "डेमो लोड करा ↗",
    drugsEntered: "औषध/औषधे नोंदवली", cascadeActive: "✓ कॅस्केड डिटेक्शन सक्रिय",
    addMore: "— कॅस्केड विश्लेषणासाठी 3+ औषधे जोडा",
    drugNamePlaceholder: "औषधाचे नाव (उदा. मेटोप्रोलॉल)", dosePlaceholder: "डोस",
    selectSpecialist: "तज्ञ निवडा", addAnotherDrug: "+ आणखी एक औषध जोडा",
    patientContext: "रुग्णाची माहिती", age: "वय", agePlaceholder: "उदा. 68",
    egfr: "eGFR (मूत्रपिंड कार्य)", egfrPlaceholder: "उदा. 55",
    allergies: "ज्ञात ऍलर्जी (स्वल्पविरामाने वेगळे करा)", allergiesPlaceholder: "उदा. पेनिसिलिन, सल्फा",
    analyze: "इंटरॅक्शन कॅस्केड विश्लेषण करा", analyzing: "कॅस्केड धोक्याचे विश्लेषण होत आहे...",
    copyReport: "अहवाल कॉपी करा", copied: "कॉपी झाले ✓", exportPDF: "PDF निर्यात करा",
    overallRisk: "एकूण धोक्याची पातळी",
    cascadePaths: "कॅस्केड मार्ग", pairwiseInteractions: "जोडी इंटरॅक्शन",
    cascadeFingerprint: "कॅस्केड फिंगरप्रिंट™", enzymeNetwork: "एन्झाइम इंटरॅक्शन नेटवर्क",
    cascadeDrug: "कॅस्केड औषध", safeDrug: "सुरक्षित औषध",
    cascadePath: "कॅस्केड मार्ग", particleNote: "हलणारे ठिपके = एन्झाइमद्वारे धोका प्रवाह",
    cascadeDetected: "⚠ कॅस्केड इंटरॅक्शन आढळल्या — जोडी-तपासणीत दिसत नाहीत",
    riskScore: "धोका स्कोअर", inhibitors: "अवरोधक", affected: "प्रभावित", inducers: "प्रेरक",
    evidenceGrade: "पुरावा स्तर", interactionType: "प्रकार",
    pairwiseTitle: "जोडी इंटरॅक्शन", mechanism: "यंत्रणा", effect: "परिणाम",
    management: "व्यवस्थापन", alternative: "पर्याय", fullReport: "संपूर्ण क्लिनिकल अहवाल",
    patientRiskFactors: "रुग्ण जोखीम घटक", riskSummary: "जोखीम सारांश",
    emptyTitle: "लपलेले कॅस्केड धोके उघड करण्यासाठी रुग्णाची संपूर्ण औषध यादी नोंदवा.",
    emptySubtitle: "CRITICAL कॅस्केड दर्शवणाऱ्या उदाहरणासाठी \"डेमो लोड करा\" वर क्लिक करा.",
    cardiologist: "हृदयरोग तज्ञ", endocrinologist: "अंतःस्रावी तज्ञ",
    rheumatologist: "संधिवात तज्ञ", psychiatrist: "मनोचिकित्सक",
    neurologist: "मज्जातंतू तज्ञ", pulmonologist: "फुफ्फुस तज्ञ",
    gastroenterologist: "पचन तज्ञ", gp: "सामान्य वैद्य", other: "इतर",
    uploadPrescription: "प्रिस्क्रिप्शन फोटो अपलोड करा",
    readingPrescription: "प्रिस्क्रिप्शन वाचत आहे...",
    drugsFound: "औषध/औषधे प्रिस्क्रिप्शनमध्ये सापडली",
    uploadError: "प्रिस्क्रिप्शन वाचता आले नाही. कृपया औषधे स्वहस्ते नोंदवा.",
};


const bn: Record<Key, string> = {
    appName: "Cascade", tagline: "বহু-ওষুধ ক্যাসকেড ইন্টারঅ্যাকশন পরীক্ষক",
    disclaimer: "শুধুমাত্র ক্লিনিকাল সিদ্ধান্ত সমর্থন — ফার্মাসিস্ট পর্যালোচনার বিকল্প নয়",
    patientMedications: "রোগীর ওষুধ", loadDemo: "ডেমো লোড করুন ↗",
    drugsEntered: "ওষুধ প্রবেশ করা হয়েছে", cascadeActive: "✓ ক্যাসকেড সনাক্তকরণ সক্রিয়",
    addMore: "— ক্যাসকেড বিশ্লেষণের জন্য ৩+ যোগ করুন",
    drugNamePlaceholder: "ওষুধের নাম (যেমন মেটোপ্রোলল)", dosePlaceholder: "ডোজ",
    selectSpecialist: "বিশেষজ্ঞ নির্বাচন করুন", addAnotherDrug: "+ আরেকটি ওষুধ যোগ করুন",
    patientContext: "রোগীর প্রেক্ষাপট", age: "বয়স", agePlaceholder: "যেমন ৬৮",
    egfr: "eGFR (কিডনির কাজ)", egfrPlaceholder: "যেমন ৫৫",
    allergies: "জানা অ্যালার্জি (কমা দিয়ে আলাদা করুন)", allergiesPlaceholder: "যেমন পেনিসিলিন",
    analyze: "ইন্টারঅ্যাকশন ক্যাসকেড বিশ্লেষণ করুন", analyzing: "ক্যাসকেড ঝুঁকি বিশ্লেষণ করা হচ্ছে...",
    copyReport: "রিপোর্ট কপি করুন", copied: "কপি করা হয়েছে ✓", exportPDF: "PDF এক্সপোর্ট করুন",
    overallRisk: "সামগ্রিক ঝুঁকির স্তর",
    cascadePaths: "ক্যাসকেড পথ", pairwiseInteractions: "জোড়া ইন্টারঅ্যাকশন",
    cascadeFingerprint: "ক্যাসকেড ফিঙ্গারপ্রিন্ট™", enzymeNetwork: "এনজাইম ইন্টারঅ্যাকশন নেটওয়ার্ক",
    cascadeDrug: "ক্যাসকেড ওষুধ", safeDrug: "নিরাপদ ওষুধ",
    cascadePath: "ক্যাসকেড পথ", particleNote: "চলন্ত বিন্দু = এনজাইমের মাধ্যমে ঝুঁকি প্রবাহ",
    cascadeDetected: "⚠ ক্যাসকেড ইন্টারঅ্যাকশন পাওয়া গেছে — জোড়া-পরীক্ষায় দেখা যায় না",
    riskScore: "ঝুঁকি স্কোর", inhibitors: "প্রতিরোধক", affected: "ক্ষতিগ্রস্ত", inducers: "প্রবর্তক",
    evidenceGrade: "প্রমাণের গ্রেড", interactionType: "প্রকার",
    pairwiseTitle: "জোড়া ইন্টারঅ্যাকশন", mechanism: "পদ্ধতি", effect: "প্রভাব",
    management: "পরিচালনা", alternative: "বিকল্প", fullReport: "সম্পূর্ণ ক্লিনিকাল রিপোর্ট",
    patientRiskFactors: "রোগীর ঝুঁকির কারণ", riskSummary: "ঝুঁকির সারাংশ",
    emptyTitle: "লুকানো ক্যাসকেড ঝুঁকি প্রকাশ করতে রোগীর সম্পূর্ণ ওষুধের তালিকা প্রবেশ করুন।",
    emptySubtitle: "একটি গুরুতর ক্যাসকেড দেখানোর জন্য 'ডেমো লোড করুন' এ ক্লিক করুন।",
    cardiologist: "হৃদরোগ বিশেষজ্ঞ", endocrinologist: "এন্ডোক্রিনোলজিস্ট",
    rheumatologist: "রিউমাটোলজিস্ট", psychiatrist: "মনোরোগ বিশেষজ্ঞ",
    neurologist: "স্নায়ুরোগ বিশেষজ্ঞ", pulmonologist: "ফুসফুস বিশেষজ্ঞ",
    gastroenterologist: "গ্যাস্ট্রোএন্টেরোলজিস্ট", gp: "সাধারণ চিকিৎসক", other: "অন্যান্য",
    uploadPrescription: "প্রেসক্রিপশনের ছবি আপলোড করুন",
    readingPrescription: "প্রেসক্রিপশন পড়া হচ্ছে...",
    drugsFound: "ওষুধ পাওয়া গেছে",
    uploadError: "প্রেসক্রিপশন পড়া যায়নি। দয়া করে ম্যানুয়ালি ওষুধ প্রবেশ করুন।",
};

const ta: Record<Key, string> = {
    appName: "Cascade", tagline: "பல-மருந்து அடுக்கு தொடர்பு சோதனையாளர்",
    disclaimer: "மருத்துவ முடிவு ஆதரவு மட்டுமே — மருந்தாளர் ஆலோசனைக்கு மாற்றல்ல",
    patientMedications: "நோயாளியின் மருந்துகள்", loadDemo: "டெமோ ஏற்றவும் ↗",
    drugsEntered: "மருந்து(கள்) உள்ளிடப்பட்டது", cascadeActive: "✓ அடுக்கு கண்டறிதல் செயலில்",
    addMore: "— அடுக்கு பகுப்பாய்வுக்கு 3+ சேர்க்கவும்",
    drugNamePlaceholder: "மருந்தின் பெயர் (உ.ம்: மெட்டோப்ரோலால்)", dosePlaceholder: "அளவு",
    selectSpecialist: "நிபுணரைத் தேர்ந்தெடுக்கவும்", addAnotherDrug: "+ மற்றொரு மருந்தைச் சேர்க்கவும்",
    patientContext: "நோயாளியின் பின்னணி", age: "வயது", agePlaceholder: "உ.ம்: 68",
    egfr: "eGFR (சிறுநீரக செயல்பாடு)", egfrPlaceholder: "உ.ம்: 55",
    allergies: "அறியப்பட்ட ஒவ்வாமைகள்", allergiesPlaceholder: "உ.ம்: பென்சிலின்",
    analyze: "தொடர்பு அடுக்கை பகுப்பாய்வு செய்", analyzing: "ஆபத்து பகுப்பாய்வு செய்யப்படுகிறது...",
    copyReport: "அறிக்கையை நகலெடு", copied: "நகலெடுக்கப்பட்டது ✓", exportPDF: "PDF ஏற்றுமதி",
    overallRisk: "ஒட்டுமொத்த ஆபத்து நிலை",
    cascadePaths: "அடுக்கு பாதை", pairwiseInteractions: "ஜோடி தொடர்புகள்",
    cascadeFingerprint: "அடுக்கு கைரேகை™", enzymeNetwork: "நொதி தொடர்பு வலைப்பின்னல்",
    cascadeDrug: "அடுக்கு மருந்து", safeDrug: "பாதுகாப்பான மருந்து",
    cascadePath: "அடுக்கு பாதை", particleNote: "நகரும் புள்ளிகள் = நொதி வழியாக ஆபத்து ஓட்டம்",
    cascadeDetected: "⚠ அடுக்கு தொடர்புகள் கண்டறியப்பட்டுள்ளன",
    riskScore: "ஆபத்து மதிப்பெண்", inhibitors: "தடுப்பான்கள்", affected: "பாதிக்கப்பட்டவை", inducers: "தூண்டிகள்",
    evidenceGrade: "சான்று தரம்", interactionType: "வகை",
    pairwiseTitle: "ஜோடி தொடர்புகள்", mechanism: "வழிமுறை", effect: "விளைவு",
    management: "மேலாண்மை", alternative: "மாற்று", fullReport: "முழு அறிக்கை",
    patientRiskFactors: "நோயாளியின் ஆபத்து காரணிகள்", riskSummary: "ஆபத்து சுருக்கம்",
    emptyTitle: "மறைக்கப்பட்ட அடுக்கு ஆபத்துகளை வெளிப்படுத்த முழு மருந்து பட்டியலை உள்ளிடவும்.",
    emptySubtitle: "விளக்கத்தைக் காண 'டெமோ ஏற்றவும்' என்பதை கிளிக் செய்யவும்.",
    cardiologist: "இதய நோய் நிபுணர்", endocrinologist: "நாளமில்லா சுரப்பி நிபுணர்",
    rheumatologist: "வாத நோய் நிபுணர்", psychiatrist: "மனநல மருத்துவர்",
    neurologist: "நரம்பியல் நிபுணர்", pulmonologist: "நுரையீரல் நிபுணர்",
    gastroenterologist: "இரைப்பை குடல் நிபுணர்", gp: "பொது மருத்துவர்", other: "மற்றவை",
    uploadPrescription: "பரிந்துரை சீட்டை பதிவேற்றவும்",
    readingPrescription: "படிக்கப்படுகிறது...",
    drugsFound: "மருந்து(கள்) கண்டறியப்பட்டன",
    uploadError: "படிக்க முடியவில்லை. கைமுறையாக உள்ளிடவும்.",
};

const te: Record<Key, string> = {
    appName: "Cascade", tagline: "బహుళ-మందుల కాస్కేడ్ పరస్పర చర్య చెకర్",
    disclaimer: "క్లినికల్ నిర్ణయ మద్దతు మాత్రమే — ఫార్మసిస్ట్ సలహాకు ప్రత్యామ్నాయం కాదు",
    patientMedications: "రోగి మందులు", loadDemo: "డెమోను లోడ్ చేయండి ↗",
    drugsEntered: "మందులు నమోదు చేయబడ్డాయి", cascadeActive: "✓ కాస్కేడ్ గుర్తింపు చురుకుగా ఉంది",
    addMore: "— కాస్కేడ్ విశ్లేషణ కోసం 3+ జోడించండి",
    drugNamePlaceholder: "మందు పేరు", dosePlaceholder: "మోతాదు",
    selectSpecialist: "నిపుణుడిని ఎంచుకోండి", addAnotherDrug: "+ మరొక మందును జోడించండి",
    patientContext: "రోగి సందర్భం", age: "వయస్సు", agePlaceholder: "ఉదా. 68",
    egfr: "eGFR (మూత్రపిండాల పనితీరు)", egfrPlaceholder: "ఉదా. 55",
    allergies: "అలెర్జీలు", allergiesPlaceholder: "ఉదా. పెన్సిలిన్",
    analyze: "కాస్కేడ్ విశ్లేషించండి", analyzing: "విశ్లేషిస్తోంది...",
    copyReport: "నివేదికను కాపీ చేయండి", copied: "కాపీ చేయబడింది ✓", exportPDF: "PDF ఎగుమతి",
    overallRisk: "మొత్తం ప్రమాద స్థాయి",
    cascadePaths: "కాస్కేడ్ మార్గం", pairwiseInteractions: "జంట పరస్పర చర్యలు",
    cascadeFingerprint: "కాస్కేడ్ వేలిముద్ర™", enzymeNetwork: "ఎంజైమ్ నెట్‌వర్క్",
    cascadeDrug: "కాస్కేడ్ మందు", safeDrug: "సురక్షిత మందు",
    cascadePath: "కాస్కేడ్ మార్గం", particleNote: "కదిలే చుక్కలు = ప్రమాద ప్రవాహం",
    cascadeDetected: "⚠ కాస్కేడ్ పరస్పర చర్యలు కనుగొనబడ్డాయి",
    riskScore: "ప్రమాద స్కోరు", inhibitors: "నిరోధకాలు", affected: "ప్రభావితమైనవి", inducers: "ప్రేరేపకాలు",
    evidenceGrade: "సాక్ష్యం గ్రేడ్", interactionType: "రకం",
    pairwiseTitle: "జంట పరస్పర చర్యలు", mechanism: "యంత్రాంగం", effect: "ప్రభావం",
    management: "నిర్వహణ", alternative: "ప్రత్యామ్నాయం", fullReport: "పూర్తి నివేదిక",
    patientRiskFactors: "ప్రమాద కారకాలు", riskSummary: "ప్రమాద సారాంశం",
    emptyTitle: "దాచిన ప్రమాదాలను బహిర్గతం చేయడానికి మందుల జాబితాను నమోదు చేయండి.",
    emptySubtitle: "ఉదాహరణ చూడటానికి 'డెమో లోడ్ చేయండి' క్లిక్ చేయండి.",
    cardiologist: "హృద్రోగ నిపుణుడు", endocrinologist: "ఎండోక్రినాలజిస్ట్",
    rheumatologist: "రుమటాలజిస్ట్", psychiatrist: "మానసిక వైద్యుడు",
    neurologist: "నరాల నిపుణుడు", pulmonologist: "ఊపిరితిత్తుల నిపుణుడు",
    gastroenterologist: "గ్యాస్ట్రోఎంటరాలజిస్ట్", gp: "సాధారణ వైద్యుడు", other: "ఇతరులు",
    uploadPrescription: "ప్రిస్క్రిప్షన్ అప్‌లోడ్ చేయండి",
    readingPrescription: "చదువుతోంది...",
    drugsFound: "మందులు కనుగొనబడ్డాయి",
    uploadError: "చదవలేకపోయాము. మాన్యువల్‌గా నమోదు చేయండి.",
};

const gu: Record<Key, string> = {
    appName: "Cascade", tagline: "બહુ-દવા કાસ્કેડ ક્રિયાપ્રતિક્રિયા ચેકર",
    disclaimer: "માત્ર ક્લિનિકલ નિર્ણય આધાર — ફાર્માસિસ્ટ સલાહનો વિકલ્પ નથી",
    patientMedications: "દર્દીની દવાઓ", loadDemo: "ડેમો લોડ કરો ↗",
    drugsEntered: "દવાઓ દાખલ કરી", cascadeActive: "✓ કાસ્કેડ શોધ સક્રિય",
    addMore: "— વિશ્લેષણ માટે 3+ ઉમેરો",
    drugNamePlaceholder: "દવાનું નામ", dosePlaceholder: "ડોઝ",
    selectSpecialist: "નિષ્ણાત પસંદ કરો", addAnotherDrug: "+ બીજી દવા ઉમેરો",
    patientContext: "દર્દીનો સંદર્ભ", age: "ઉંમર", agePlaceholder: "દા.ત. 68",
    egfr: "eGFR (કિડની કાર્ય)", egfrPlaceholder: "દા.ત. 55",
    allergies: "એલર્જી", allergiesPlaceholder: "દા.ત. પેનિસિલિન",
    analyze: "વિશ્લેષણ કરો", analyzing: "વિશ્લેષણ થઈ રહ્યું છે...",
    copyReport: "રિપોર્ટ કૉપિ કરો", copied: "કૉપિ થઈ ગયું ✓", exportPDF: "PDF નિકાસ કરો",
    overallRisk: "કુલ જોખમ સ્તર",
    cascadePaths: "કાસ્કેડ માર્ગ", pairwiseInteractions: "જોડી ક્રિયાપ્રતિક્રિયા",
    cascadeFingerprint: "કાસ્કેડ ફિંગરપ્રિન્ટ™", enzymeNetwork: "એન્ઝાઇમ નેટવર્ક",
    cascadeDrug: "કાસ્કેડ દવા", safeDrug: "સુરક્ષિત દવા",
    cascadePath: "કાસ્કેડ માર્ગ", particleNote: "ખસતા બિંદુઓ = જોખમ પ્રવાહ",
    cascadeDetected: "⚠ કાસ્કેડ ક્રિયાપ્રતિક્રિયાઓ મળી",
    riskScore: "જોખમ સ્કોર", inhibitors: "અવરોધકો", affected: "અસરગ્રસ્ત", inducers: "પ્રેરકો",
    evidenceGrade: "પુરાવા ગ્રેડ", interactionType: "પ્રકાર",
    pairwiseTitle: "જોડી ક્રિયાપ્રતિક્રિયા", mechanism: "મિકેનિઝમ", effect: "અસર",
    management: "વહીવટ", alternative: "વિકલ્પ", fullReport: "સંપૂર્ણ રિપોર્ટ",
    patientRiskFactors: "જોખમ પરિબળો", riskSummary: "જોખમ સારાંશ",
    emptyTitle: "છુપાયેલા જોખમોને જાહેર કરવા માટે દવાની સૂચિ દાખલ કરો.",
    emptySubtitle: "ઉદાહરણ જોવા માટે 'ડેમો લોડ કરો' ક્લિક કરો.",
    cardiologist: "કાર્ડિયોલોજિસ્ટ", endocrinologist: "એન્ડોક્રિનોલોજિસ્ટ",
    rheumatologist: "રુમેટોલોજિસ્ટ", psychiatrist: "મનોચિકિત્સક",
    neurologist: "ન્યુરોલોજીસ્ટ", pulmonologist: "પલ્મોનોલોજિસ્ટ",
    gastroenterologist: "ગેસ્ટ્રોએન્ટેરોલોજિસ્ટ", gp: "સામાન્ય ચિકિત્સક", other: "અન્ય",
    uploadPrescription: "પ્રિસ્ક્રિપ્શન અપલોડ કરો",
    readingPrescription: "વાંચી રહ્યા છે...",
    drugsFound: "દવાઓ મળી",
    uploadError: "વાંચી શક્યા નહીં. જાતે દાખલ કરો.",
};

const translations: Record<Lang, Record<Key, string>> = { en, hi, mr, bn, ta, te, gu };


export function useTranslation() {
    const [lang, setLang] = useState<Lang>("en");
    const t = useCallback(
        (key: Key): string => translations[lang][key] ?? translations["en"][key] ?? key,
        [lang],
    );
    return { t, lang, setLang };
}

export function getSpecialists(t: (key: Key) => string): string[] {
    return [
        t("cardiologist"), t("endocrinologist"), t("rheumatologist"),
        t("psychiatrist"), t("neurologist"), t("pulmonologist"),
        t("gastroenterologist"), t("gp"), t("other"),
    ];
}