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

/* eslint-disable no-undef */

import {expect} from 'chai';
import {stringToField} from '../src/index';

describe('stringToField', () => {
	it('should convert field string to object', () => {
		const result = stringToField('100 12 ‡asomething‡belse');

		expect(result).to.deep.equal({
			tag: '100',
			ind1: '1',
			ind2: '2',
			subfields: [
				{
					code: 'a',
					value: 'something'
				},
				{
					code: 'b',
					value: 'else'
				}
			]
		});
	});
});
