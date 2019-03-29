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

import sortAlphabetically from './sort-alphabetically';
import sortBy264 from './sort-by-264';
import sortByIndexTerms from './sort-by-index-terms';
import sortByLOW from './sort-by-low';
import sortBySID from './sort-by-sid';
import sortByTag from './sort-by-tag';

const sorterFunctions = [sortByTag, sortByLOW, sortBySID, sortByIndexTerms, sortBy264, sortAlphabetically];

export default function fieldOrderComparator(fieldA, fieldB) {
	for (const sortFn of sorterFunctions) {
		const result = sortFn(fieldA, fieldB);

		if (result !== 0) {
			return result;
		}
	}

	return 0;
}
