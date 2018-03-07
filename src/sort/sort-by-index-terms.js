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

import lowerCase from 'lodash/lowerCase';
import get from 'lodash/get';
import includes from 'lodash/includes';
import selectFirstValue from '../select-first-value';
import fieldHasSubfield from '../field-has-subfield';
import dictionarySortIndex from './dictionary-sort-index';

export default function sortByIndexTerms(fieldA, fieldB) {
	const indexTermFields = [
		'600', '610', '611', '630', '648', '650', '651', '652',
		'653', '654', '655', '656', '657', '658', '659', '662'];

	if (fieldA.tag === fieldB.tag && includes(indexTermFields, fieldA.tag)) {
		if (fieldA.ind2 > fieldB.ind2) {
			return 1;
		}
		if (fieldA.ind2 < fieldB.ind2) {
			return -1;
		}

		const dictionaryA = selectFirstValue(fieldA, '2');
		const dictionaryB = selectFirstValue(fieldB, '2');

		const orderByDictionaryA = get(dictionarySortIndex, dictionaryA, dictionaryA);
		const orderByDictionaryB = get(dictionarySortIndex, dictionaryB, dictionaryB);

		if (orderByDictionaryA > orderByDictionaryB) {
			return 1;
		}
		if (orderByDictionaryA < orderByDictionaryB) {
			return -1;
		}

		const fenniKeepSelector = fieldHasSubfield('9', 'FENNI<KEEP>');
		const fenniDropSelector = fieldHasSubfield('9', 'FENNI<DROP>');
		const hasFENNI9A = fenniKeepSelector(fieldA) || fenniDropSelector(fieldA);
		const hasFENNI9B = fenniKeepSelector(fieldB) || fenniDropSelector(fieldA);

		if (hasFENNI9A && !hasFENNI9B) {
			return -1;
		}
		if (!hasFENNI9A && hasFENNI9B) {
			return 1;
		}

		const valueA = lowerCase(selectFirstValue(fieldA, 'a'));
		const valueB = lowerCase(selectFirstValue(fieldB, 'a'));

		if (valueA > valueB) {
			return 1;
		}
		if (valueA < valueB) {
			return -1;
		}

		const valueAX = lowerCase(selectFirstValue(fieldA, 'x'));
		const valueBX = lowerCase(selectFirstValue(fieldB, 'x'));

		if (valueBX === undefined || valueAX > valueBX) {
			return 1;
		}
		if (valueAX < valueBX) {
			return -1;
		}

		const valueAZ = lowerCase(selectFirstValue(fieldA, 'z'));
		const valueBZ = lowerCase(selectFirstValue(fieldB, 'z'));

		if (valueBZ === undefined || valueAZ > valueBZ) {
			return 1;
		}
		if (valueAZ < valueBZ) {
			return -1;
		}

		const valueAY = lowerCase(selectFirstValue(fieldA, 'y'));
		const valueBY = lowerCase(selectFirstValue(fieldB, 'y'));

		if (valueBY === undefined || valueAY > valueBY) {
			return 1;
		}
		if (valueAY < valueBY) {
			return -1;
		}
	}
	return 0;
}
