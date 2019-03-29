/**
*
* @licstart  The following is the entire license notice for the JavaScript code in this file.
*
* Utility functions for dealing with MARC records
*
* Copyright (C) 2018-2019 University Of Helsinki (The National Library Of Finland)
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
import selectFirstValue from '../select-first-value';

export default function sortBy264(fieldA, fieldB) {
	if (fieldA.tag === '264' && fieldB.tag === '264') {
		if (fieldA.ind2 > fieldB.ind2) {
			return 1;
		}

		if (fieldA.ind2 < fieldB.ind2) {
			return -1;
		}

		if (fieldA.ind1 > fieldB.ind1) {
			return 1;
		}

		if (fieldA.ind1 < fieldB.ind1) {
			return -1;
		}

		const value3A = lowerCase(selectFirstValue(fieldA, '3'));
		const value3B = lowerCase(selectFirstValue(fieldB, '3'));

		if (value3A === undefined || value3A < value3B) {
			return -1;
		}

		if (value3B === undefined || value3A > value3B) {
			return 1;
		}

		const valueCA = lowerCase(selectFirstValue(fieldA, 'c'));
		const valueCB = lowerCase(selectFirstValue(fieldB, 'c'));

		if (valueCA === undefined || valueCA < valueCB) {
			return -1;
		}

		if (valueCB === undefined || valueCA > valueCB) {
			return 1;
		}

		const valueAA = lowerCase(selectFirstValue(fieldA, 'a'));
		const valueAB = lowerCase(selectFirstValue(fieldB, 'a'));

		if (valueAA === undefined || valueAA < valueAB) {
			return -1;
		}

		if (valueAB === undefined || valueAA > valueAB) {
			return 1;
		}

		const valueBA = lowerCase(selectFirstValue(fieldA, 'b'));
		const valueBB = lowerCase(selectFirstValue(fieldB, 'b'));

		if (valueBA === undefined || valueBA < valueBB) {
			return -1;
		}

		if (valueBB === undefined || valueBA > valueBB) {
			return 1;
		}
	}

	return 0;
}
