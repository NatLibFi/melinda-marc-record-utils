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
import selectFirstValue from '../select-first-value';

export default function sortBySID(fieldA, fieldB) {
	if (fieldA.tag === 'SID' && fieldB.tag === 'SID') {
		const sidA = lowerCase(selectFirstValue(fieldA, 'b'));
		const sidB = lowerCase(selectFirstValue(fieldB, 'b'));
		if (sidA > sidB) {
			return 1;
		}
		if (sidA < sidB) {
			return -1;
		}
	}
	return 0;
}
