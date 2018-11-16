/**
*
* @licstart  The following is the entire license notice for the JavaScript code in this file.
*
* Utility functions for dealing with MARC records
*
* Copyright (C) 2018 University Of Helsinki (The National Library Of Finland)
*
* This file is part of melinda-marc-record-utils
*
* melinda-marc-record-utils is free software: you can redistribute it and/or modify
* it under the terms of the GNU Lesser General Public License as published by
* the Free Software Foundation, either version 3 of the License, or
* (at your option) any later version.
*
* melinda-marc-record-utils is distributed in the hope that it will be useful,
* but WITHOUT ANY WARRANTY; without even the implied warranty of
* MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
* GNU Lesser General Public License for more details.
*
* You should have received a copy of the GNU Lesser General Public License
* along with this program.  If not, see <http://www.gnu.org/licenses/>.
*
* @licend  The above is the entire license notice
* for the JavaScript code in this file.
*
*/
import includes from 'lodash/includes';
import head from 'lodash/head';
import createDebug from 'debug';
import fieldToString from '../field-to-string';

import RecordTypes from './record-types';
import PunctuationError from './punctuation-error';

const debug = createDebug('marc-record-punctuation');

export default function createPunctuationFixer(rules, recordType = RecordTypes.BIBLIOGRAPHIC) {
	function punctuateField(field) {
		debug(`Handling field ${field.tag}`);
		debug(`Field contents: ${fieldToString(field)}`);
		const rulesForField = getRulesForField(field.tag);
		if (rulesForField.length === 0) {
			debug(`No matching rules for field ${field.tag}`);
			return;
		}

		let currentPortion;
		let preceedingField;
		let inNamePortion = true;

		debug(`Field subfields: ${field.subfields.map(sub => sub.code)}`);
		debug(`Field portions: ${field.subfields.map(sub => getPortion(sub, rulesForField))}`);

		field.subfields.forEach(subfield => {
			debug(`Handling subfield ${subfield.code}`);
			let portion = getPortion(subfield, rulesForField);

			if (portion === 'CF' || portion === 'NC') {
				return;
			}

			if (inNamePortion && includes('T', 'S', portion)) {
				debug(`Portion changed to ${portion}. Not in name portion anymore`);
				inNamePortion = false;
			}

			if (inNamePortion && portion === 'NT') {
				portion = 'N';
			}
			if (!inNamePortion && portion === 'NT') {
				portion = 'T';
			}

			debug(`Current portion is ${portion}.`);

			if (currentPortion) {
				if (currentPortion === portion) {
					debug(`Current stayed as ${portion}. Adding punctuation for subfield.`);
					addSubfieldPunctuation(preceedingField, subfield, rulesForField);
				} else {
					debug(`Current portion changed to ${portion}.`);
					if (portion !== 'S') {
						debug('Adding punctuation for portion.');
						addNamePortionPunctuation(preceedingField);
					}
				}
			}

			currentPortion = portion;
			preceedingField = subfield;
		});

		if (recordType === RecordTypes.BIBLIOGRAPHIC) {
			addNamePortionPunctuation(preceedingField);
		}
		debug(`After punctuation: ${fieldToString(field)}`);
	}

	function getRulesForField(tag) {
		return rules.filter(rule => rule.selector.test(tag));
	}

	function getPortion(subfield, rules) {
		debug(`Looking for namePortion for ${subfield.code}`);
		const portions = rules.filter(rule => rule.namePortion === subfield.code).map(rule => rule.portion);

		if (portions.length === 0) {
			throw new PunctuationError(`Unknown subfield code ${subfield.code}`);
		}
		return head(portions).toUpperCase();
	}

	function addNamePortionPunctuation(preceedingSubfield) {
		const subfieldContainsPunctuation = /[?")\].\-!,]$/.test(preceedingSubfield.value);
		if (!subfieldContainsPunctuation) {
			const nextValue = preceedingSubfield.value + '.';
			debug(`Updated subfield ${preceedingSubfield.code} from '${preceedingSubfield.value}' to '${nextValue}'`);
			preceedingSubfield.value = nextValue;
		}
	}

	function addSubfieldPunctuation(preceedingSubfield, currentSubfield, rules) {
		const punctType = getPrecedingPunctuation(currentSubfield, rules);
		const exceptionsFunctions = getExceptions(currentSubfield, rules);

		const isExceptionCase = exceptionsFunctions.some(fn => {
			return fn(preceedingSubfield);
		});

		if (isExceptionCase) {
			return;
		}

		const endsInPunctuation = /[?")\]\-!,]$/.test(preceedingSubfield.value);
		debug(`addSubfieldPunctuation -- punctType: ${punctType} endsInPunctuation: ${endsInPunctuation}`);

		if (!endsInPunctuation) {
			if (punctType === 'PERIOD' && !/\.$/.test(preceedingSubfield.value)) {
				const nextValue = preceedingSubfield.value + '.';
				debug(`Updated subfield ${preceedingSubfield.code} from '${preceedingSubfield.value}' to '${nextValue}'`);
				preceedingSubfield.value = nextValue;
			}
		}

		if (punctType === 'COMMA') {
			if (!/,$/.test(preceedingSubfield.value)) {
				if (!/^[[(]/.test(currentSubfield.value)) {
					const nextValue = preceedingSubfield.value + ',';
					debug(`Updated subfield ${preceedingSubfield.code} from '${preceedingSubfield.value}' to '${nextValue}'`);
					preceedingSubfield.value = nextValue;
				}
			}
		}
		if (punctType === 'COND_COMMA') {
			if (!/[-,]$/.test(preceedingSubfield.value)) {
				const nextValue = preceedingSubfield.value + ',';
				debug(`Updated subfield ${preceedingSubfield.code} from '${preceedingSubfield.value}' to '${nextValue}'`);
				preceedingSubfield.value = nextValue;
			}
		}

		debug('addSubfieldPunctuation -- end');
	}

	function getPrecedingPunctuation(subfield, rules) {
		const punct = rules.filter(rule => rule.namePortion === subfield.code).map(rule => rule.preceedingPunctuation);

		if (punct.length === 0) {
			throw new PunctuationError(`Unknown subfield code ${subfield.code}`);
		}
		return head(punct).toUpperCase();
	}

	function getExceptions(subfield, rules) {
		const exceptions = rules.filter(rule => rule.namePortion === subfield.code).map(rule => parseExceptions(rule.exceptions));

		if (exceptions.length === 0) {
			throw new PunctuationError(`Unknown subfield code ${subfield.code}`);
		}
		return head(exceptions);
	}

	function parseExceptions(expectionsString) {
		const exceptionRules = expectionsString.split('\n');
		const exceptionFuncs = [];

		exceptionRules.forEach(exceptionRule => {
			const match = /- (.*) if preceded by (.*)/.exec(exceptionRule);
			if (match) {
				const [, type, preceededCode] = match;
				const normalizedType = type.trim().toUpperCase().trim();
				const normalizedCode = preceededCode.replace(/\$/g, '').trim();
				exceptionFuncs.push(ifPrecededByException(normalizedCode, normalizedType));
			}
		});

		return exceptionFuncs;
	}

	function ifPrecededByException(code, type) {
		return preceedingSubfield => {
			if (code === preceedingSubfield.code) {
				debug(`Adding ${type} to ${preceedingSubfield.code}`);
				if (type === 'SEMICOLON' && !/;$/.test(preceedingSubfield.value)) {
					const nextValue = preceedingSubfield.value + ' ;';
					debug(`Updated subfield ${preceedingSubfield.code} from '${preceedingSubfield.value}' to '${nextValue}'`);
					preceedingSubfield.value = nextValue;
				}
				if (type === 'COLON' && !/:$/.test(preceedingSubfield.value)) {
					const nextValue = preceedingSubfield.value + ' :';
					debug(`Updated subfield ${preceedingSubfield.code} from '${preceedingSubfield.value}' to '${nextValue}'`);
					preceedingSubfield.value = nextValue;
				}
				return true;
			}
			return false;
		};
	}

	return punctuateField;
}
