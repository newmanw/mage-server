"use strict"

var Setting = require('../models/setting')
    , log = require('winston');

const SPECIAL_CHARS = '~!@#$%^&*(),.?":{}|<>_=;-';

function validate(strategy, password) {
    let validationStatus = {
        isValid: true,
        failedKeys: [],
        msg: ""
    };

    if (!strategy || !password) {
        log.warn('strategy or password is missing');
        log.warn('strategy: ' + strategy);
        validationStatus.isValid = false;
        validationStatus.msg = "Password or strategy is missing";
        return Promise.resolve(validationStatus);
    }

    return Setting.getSetting("security").then(securitySettings => {
        if (!securitySettings || !securitySettings.settings || !securitySettings.settings[strategy]) {
            log.debug('No security settings found for the strategy named: ' + strategy);
            return validationStatus;
        }

        const passwordPolicy = securitySettings.settings[strategy].passwordPolicy;

        if (!passwordPolicy) {
            log.debug('No password policy is defined for the strategy named: ' + strategy);
            return validationStatus;
        }

        log.silly("Password Validation password policy: " + JSON.stringify(passwordPolicy));

        if (!validatePasswordLength(passwordPolicy, password)) {
            validationStatus.failedKeys.push('passwordMinLength');
        }
        if (!validateMinimumCharacters(passwordPolicy, password)) {
            validationStatus.failedKeys.push('minChars');
        }
        if (!validateMaximumConsecutiveCharacters(passwordPolicy, password)) {
            validationStatus.failedKeys.push('maxConChars');
        }
        if (!validateMinimumLowercaseCharacters(passwordPolicy, password)) {
            validationStatus.failedKeys.push('lowLetters');
        }
        if (!validateMinimumUppercaseCharacters(passwordPolicy, password)) {
            validationStatus.failedKeys.push('highLetters');
        }
        if (!validateMinimumNumbers(passwordPolicy, password)) {
            validationStatus.failedKeys.push('numbers');
        }
        if (!validateMinimumSpecialCharacters(passwordPolicy, password)) {
            validationStatus.failedKeys.push('specialChars');
        }

        validationStatus.isValid = validationStatus.failedKeys.length == 0;

        if (!validationStatus.isValid) {
            validationStatus.msg = passwordPolicy.helpText;
        }

        return validationStatus;
    });
}

function validatePasswordLength(passwordPolicy, password) {
    let isValid = true;
    if (passwordPolicy.passwordMinLengthEnabled) {
        isValid = password.length >= passwordPolicy.passwordMinLength;

        log.debug('Password meets min length: ' + isValid);
    }
    return isValid;
}

function validateMinimumCharacters(passwordPolicy, password) {
    let isValid = true;
    if (passwordPolicy.minCharsEnabled) {
        let passwordCount = 0;
        for (let i = 0; i < password.length; i++) {
            let a = password[i];

            if (a.match(/[a-z]/i)) {
                passwordCount++;
            }
        }

        isValid = passwordCount >= passwordPolicy.minChars;
        log.debug('Password meets miniminum letters: ' + isValid);
    }
    return isValid;
}

function validateMaximumConsecutiveCharacters(passwordPolicy, password) {
    let isValid = true;
    if (passwordPolicy.maxConCharsEnabled) {
        let conCount = 0;
        for (let i = 0; i < password.length; i++) {
            let a = password[i];

            if (a.match(/[a-z]/i)) {
                conCount++;
            } else {
                conCount = 0;
            }

            if (conCount > passwordPolicy.maxConChars) {
                isValid = false;
                break;
            }
        }
        log.debug('Password meets max consecutive letters: ' + isValid);
    }
    return isValid;
}

function validateMinimumLowercaseCharacters(passwordPolicy, password) {
    let isValid = true;
    if (passwordPolicy.lowLettersEnabled) {
        let passwordCount = 0;
        for (let i = 0; i < password.length; i++) {
            let a = password[i];

            if (a.match(/[a-z]/)) {
                passwordCount++;
            }
        }
        isValid = passwordCount >= passwordPolicy.lowLetters;
        log.debug('Password meets minimum lowercase letters: ' + isValid);
    }
    return isValid;
}

function validateMinimumUppercaseCharacters(passwordPolicy, password) {
    let isValid = true;
    if (passwordPolicy.highLettersEnabled) {
        let passwordCount = 0;
        for (let i = 0; i < password.length; i++) {
            let a = password[i];

            if (a.match(/[A-Z]/)) {
                passwordCount++;
            }
        }
        isValid = passwordCount >= passwordPolicy.highLetters;
        log.debug('Password meets minimum uppercase letters: ' + isValid);
    }
    return isValid;
}

function validateMinimumNumbers(passwordPolicy, password) {
    let isValid = true;
    if (passwordPolicy.numbersEnabled) {
        let passwordCount = 0;
        for (let i = 0; i < password.length; i++) {
            let a = password[i];

            if (a.match(/[0-9]/)) {
                passwordCount++;
            }
        }
        isValid = passwordCount >= passwordPolicy.numbers;
        log.debug('Password meets minimum numbers: ' + isValid);
    }
    return isValid;
}

function validateMinimumSpecialCharacters(passwordPolicy, password) {
    let isValid = true;
    if (passwordPolicy.specialCharsEnabled) {
        let regex = null;
        let nonAllowedRegex = null;
        if (passwordPolicy.restrictSpecialCharsEnabled) {
            nonAllowedRegex = new RegExp('[' + createRestrictedRegex(passwordPolicy.restrictSpecialChars) + ']');
            regex = new RegExp('[' + passwordPolicy.restrictSpecialChars + ']');
        } else {
            regex = new RegExp('[' + SPECIAL_CHARS + ']');
        }

        let specialCharCount = 0;
        for (let i = 0; i < password.length; i++) {
            let a = password[i];

            if (nonAllowedRegex && a.match(nonAllowedRegex)) {
                specialCharCount = -1;
                break;
            }

            if (a.match(regex)) {
                specialCharCount++;
            }
        }
        isValid = specialCharCount >= passwordPolicy.specialChars;
        log.debug('Password meets special characters policy: ' + isValid);
    }
    return isValid;
}

function createRestrictedRegex(restrictedChars) {
    let nonAllowedRegex = '';

    for (let i = 0; i < SPECIAL_CHARS.length; i++) {
        let specialChar = SPECIAL_CHARS[i];

        if (!restrictedChars.includes(specialChar)) {
            nonAllowedRegex += specialChar;
        }
    }

    return nonAllowedRegex;
}

module.exports = {
    validate
}