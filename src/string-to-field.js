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

import tail from 'lodash/tail';

export default function stringToField(fieldStr) {
	const tag = fieldStr.substr(0, 3);
	const ind1 = fieldStr.substr(4, 1);
	const ind2 = fieldStr.substr(5, 1);
	const subfieldsStr = fieldStr.substr(6);

	const subfields = tail(subfieldsStr.split('‡')).map(subfieldStr => ({
		code: subfieldStr.substr(0, 1),
		value: subfieldStr.substr(1)
	}));

	return {tag, ind1, ind2, subfields};
}
