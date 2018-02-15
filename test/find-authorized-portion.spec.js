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
/* eslint-disable no-undef */

import {expect} from 'chai';
import {AuthorizedPortion, stringToField, fieldToString} from '../src/index';

describe('AuthorizedPortion', () => {
	describe('updateAuthorizedPortion', () => {
		describe('for BIB records', () => {
			const tests = [
				[
					'Should update the field with content from authorized portion',
					'100    ‡aAakkula, Immo,‡tcontent',
					'100    ‡aAakkula, I,‡tcontent‡0(TST10)90001',
					'100    ‡aAakkula, Immo,‡tcontent‡0(TST10)90001'
				],
				[
					'Should handle first indicator when updating authorized portion',
					'100 0  ‡aNimi, Toinen,‡d1922-1999‡0(TST10)1234',
					'100 1  ‡aToinen Nimi‡0(TST10)1234',
					'100 0  ‡aNimi, Toinen,‡d1922-1999‡0(TST10)1234'
				],
				[
					'Should handle non-100 fileds',
					'100 0  ‡aNimi, Toinen,‡d1922-1999‡0(TST10)1234',
					'700 1  ‡aToinen Nimi‡0(TST10)1234',
					'700 0  ‡aNimi, Toinen,‡d1922-1999‡0(TST10)1234'
				],
				[
					'Should not lose control subfields from target',
					'100 0  ‡aNimi, Toinen,‡d1922-1999‡0(TST10)1234',
					'100 1  ‡aToinen Nimi‡6jee‡0(TST10)1234',
					'100 0  ‡aNimi, Toinen,‡d1922-1999‡6jee‡0(TST10)1234'
				],
				[
					'Should not lose non-authorized subfields from target',
					'100 0  ‡aNimi, Toinen,‡d1922-1999‡0(TST10)1234',
					'100 1  ‡ijotain‡aToinen Nimi‡0(TST10)1234',
					'100 0  ‡ijotain‡aNimi, Toinen,‡d1922-1999‡0(TST10)1234'
				],
				[
					'Should not copy control subfields from source',
					'100 0  ‡aNimi, Toinen,‡d1922-1999‡6ctrl‡0(TST10)1234',
					'100 1  ‡aToinen Nimi‡0(TST10)1234',
					'100 0  ‡aNimi, Toinen,‡d1922-1999‡0(TST10)1234'
				],
				[
					'Should not copy zero subfields from source',
					'100 0  ‡aNimi, Toinen,‡d1922-1999‡0(TST10)1234‡0(faraway)1111',
					'100 1  ‡aToinen Nimi‡0(TST10)1234',
					'100 0  ‡aNimi, Toinen,‡d1922-1999‡0(TST10)1234'
				],
				[
					'Should not lose extra zero subfields from target',
					'100 0  ‡aNimi, Toinen,‡d1922-1999‡0(TST10)1234',
					'100 1  ‡aToinen Nimi‡0(TST10)1234‡0(faraway)1111',
					'100 0  ‡aNimi, Toinen,‡d1922-1999‡0(TST10)1234‡0(faraway)1111'
				],
				[
					'Should update tag if it has changed',
					'110    ‡aAsia joka muuttui henkilöstä yhteisöksi‡0(TST10)115575',
					'100    ‡aAsia joka on henkilö,‡cnimimerkki‡0(TST10)115575',
					'110    ‡aAsia joka muuttui henkilöstä yhteisöksi‡0(TST10)115575'
				],
				[
					'Should handle specifiers correctly when updating tag',
					'110    ‡aAsia joka muuttui kokouksesta yhteisöksi‡dcontent-2‡0(TST10)115575',
					'111    ‡aAsia joka on kokous‡0(TST10)115575',
					'110    ‡aAsia joka muuttui kokouksesta yhteisöksi‡dcontent-2‡0(TST10)115575'
				],
				[
					'Should pick and replace specifier part from 110',
					'110 2  ‡aLääketieteellisen fysiikan ja tekniikan yhdistys. ‡bProgress report -kokous ‡n(1 :‡d1979)‡0(TST10)123345',
					'110 2  ‡aLääketieteellisen fysiikan & tekniikan yhdistys. ‡bProgress report -meeting ‡n(1 :‡d1989)‡0(TST10)123345',
					'110 2  ‡aLääketieteellisen fysiikan ja tekniikan yhdistys. ‡bProgress report -kokous ‡n(1 :‡d1979)‡0(TST10)123345'
				],
				[
					'Should keep current specifier if authorized field does not have a specifier',
					'110 2  ‡aLääketieteellisen fysiikan ja tekniikan yhdistys. ‡bProgress report -kokous‡0(TST10)123345',
					'110 2  ‡aLääketieteellisen fysiikan & tekniikan yhdistys. ‡bProgress report -meeting‡n(1 :‡d1979) ‡0(TST10)123345',
					'110 2  ‡aLääketieteellisen fysiikan ja tekniikan yhdistys. ‡bProgress report -kokous‡n(1 :‡d1979) ‡0(TST10)123345'
				],
				[
					'Should not lose non-authorized subfields from 710',
					'110 2  ‡aLääketieteellisen fysiikan ja tekniikan yhdistys. ‡bProgress report -kokous‡0(TST10)123345',
					'710 2  ‡3Kirja:‡aLääketieteellisen fysiikan & tekniikan yhdistys. ‡bProgress report -meeting,‡ejulkaisija. ‡0(TST10)123345',
					'710 2  ‡3Kirja:‡aLääketieteellisen fysiikan ja tekniikan yhdistys. ‡bProgress report -kokous‡ejulkaisija. ‡0(TST10)123345'
				],
				[
					'Should add the authorized portion to the field',
					'110 2  ‡aLääketieteellisen fysiikan ja tekniikan yhdistys. ‡bProgress report -kokous.‡0(TST10)123345',
					'710 2  ‡0(TST10)123345',
					'710 2  ‡aLääketieteellisen fysiikan ja tekniikan yhdistys. ‡bProgress report -kokous.‡0(TST10)123345'
				],
				[
					'Should add the authorized portion to the field, keeping rest of the subfields',
					'110 2  ‡aLääketieteellisen fysiikan ja tekniikan yhdistys. ‡bProgress report -kokous‡0(TST10)123345',
					'710 2  ‡ejulkaisija.‡0(TST10)123345',
					'710 2  ‡aLääketieteellisen fysiikan ja tekniikan yhdistys. ‡bProgress report -kokous‡ejulkaisija.‡0(TST10)123345'
				]
			];

			tests.forEach(test => {
				const [testName, authorityRecordFieldStr, bibRecordFieldStr, expectedFieldStr] = test;

				const testerFn = testName[0] === '!' ? it.only : it;

				testerFn(testName, () => {
					const authorityRecordField = stringToField(authorityRecordFieldStr);
					const bibRecordField = stringToField(bibRecordFieldStr);

					const authorizedPortion = AuthorizedPortion.findAuthorizedPortion(AuthorizedPortion.RecordType.AUTH, authorityRecordField);
					const resultingField = AuthorizedPortion.updateAuthorizedPortion(AuthorizedPortion.RecordType.BIB, bibRecordField, authorizedPortion);
					expect(fieldToString(resultingField)).to.equal(expectedFieldStr);
				});
			});

			it('should be idempotent', () => {
				const [, authorityRecordFieldStr, linkedAuthorityRecordFieldStr, expectedFieldStr] = tests[0];

				const authorityRecordField = stringToField(authorityRecordFieldStr);
				const linkedAuthorityRecordField = stringToField(linkedAuthorityRecordFieldStr);

				const authorizedPortion = AuthorizedPortion.findAuthorizedPortion(AuthorizedPortion.RecordType.AUTH, authorityRecordField);
				const resultingField = AuthorizedPortion.updateAuthorizedPortion(AuthorizedPortion.RecordType.AUTH, linkedAuthorityRecordField, authorizedPortion);
				const resultingFieldAfterSecondApplication = AuthorizedPortion.updateAuthorizedPortion(AuthorizedPortion.RecordType.AUTH, resultingField, authorizedPortion);

				expect(fieldToString(resultingFieldAfterSecondApplication)).to.equal(expectedFieldStr);
			});

			it('should make a copy of the authorizedPortion', () => {
				const authorityRecordField = stringToField('100    ‡aAakkula, Immo');
				const bibRecordField = stringToField('100    ‡aAakkula, I,‡etestaaja.‡0(TST10)90001');

				const authorizedPortion = AuthorizedPortion.findAuthorizedPortion(AuthorizedPortion.RecordType.AUTH, authorityRecordField);
				const resultingField = AuthorizedPortion.updateAuthorizedPortion(AuthorizedPortion.RecordType.BIB, bibRecordField, authorizedPortion);

				const fieldSharesSubfieldsWithAuthorizedPortion = resultingField.subfields.some(subfield => authorizedPortion.subfields.indexOf(subfield) > -1);

				expect(fieldSharesSubfieldsWithAuthorizedPortion).to.equal(false, 'Expected resulting field not to share subfields with authorizedPortion');
			});
		});

		describe('for AUTH records', () => {
			const tests = [
				[
					'Should handle first indicator when updating authorized portion',
					'100 0  ‡aNimi, Toinen,‡d1922-1999‡0(TST10)1234',
					'500 1  ‡aToinen Nimi‡0(TST10)1234',
					'500 0  ‡aNimi, Toinen,‡d1922-1999‡0(TST10)1234'
				],
				[
					'Should not lose control subfields from target',
					'100 0  ‡aNimi, Toinen,‡d1922-1999‡0(TST10)1234',
					'500 1  ‡aToinen Nimi‡6jee‡0(TST10)1234',
					'500 0  ‡aNimi, Toinen,‡d1922-1999‡6jee‡0(TST10)1234'
				],
				[
					'Should not lose non-authorized subfields from target',
					'100 0  ‡aNimi, Toinen,‡d1922-1999‡0(TST10)1234',
					'500 1  ‡ijotain‡aToinen Nimi‡0(TST10)1234',
					'500 0  ‡ijotain‡aNimi, Toinen,‡d1922-1999‡0(TST10)1234'
				],
				[
					'Should not copy control subfields from source',
					'100 0  ‡aNimi, Toinen,‡d1922-1999‡6ctrl‡0(TST10)1234',
					'500 1  ‡aToinen Nimi‡0(TST10)1234',
					'500 0  ‡aNimi, Toinen,‡d1922-1999‡0(TST10)1234'
				],
				[
					'Should not copy zero subfields from source',
					'100 0  ‡aNimi, Toinen,‡d1922-1999‡0(TST10)1234‡0(faraway)1111',
					'500 1  ‡aToinen Nimi‡0(TST10)1234',
					'500 0  ‡aNimi, Toinen,‡d1922-1999‡0(TST10)1234'
				],
				[
					'Should not lose extra zero subfields from target',
					'100 0  ‡aNimi, Toinen,‡d1922-1999‡0(TST10)1234',
					'500 1  ‡aToinen Nimi‡0(TST10)1234‡0(faraway)1111',
					'500 0  ‡aNimi, Toinen,‡d1922-1999‡0(TST10)1234‡0(faraway)1111'
				],
				[
					'Should update tag if it has changed',
					'110    ‡aAsia joka muuttui henkilöstä yhteisöksi‡0(TST10)115575',
					'500    ‡aAsia joka on henkilö,‡cnimimerkki‡0(TST10)115575',
					'510    ‡aAsia joka muuttui henkilöstä yhteisöksi‡0(TST10)115575'
				]
			];

			tests.forEach(test => {
				const [testName, authorityRecordFieldStr, linkedAuthorityRecordFieldStr, expectedFieldStr] = test;
				it(testName, () => {
					const authorityRecordField = stringToField(authorityRecordFieldStr);
					const linkedAuthorityRecordField = stringToField(linkedAuthorityRecordFieldStr);

					const authorizedPortion = AuthorizedPortion.findAuthorizedPortion(AuthorizedPortion.RecordType.AUTH, authorityRecordField);
					const resultingField = AuthorizedPortion.updateAuthorizedPortion(AuthorizedPortion.RecordType.AUTH, linkedAuthorityRecordField, authorizedPortion);
					expect(fieldToString(resultingField)).to.equal(expectedFieldStr);
				});
			});

			it('should be idempotent', () => {
				const [, authorityRecordFieldStr, linkedAuthorityRecordFieldStr, expectedFieldStr] = tests[0];

				const authorityRecordField = stringToField(authorityRecordFieldStr);
				const linkedAuthorityRecordField = stringToField(linkedAuthorityRecordFieldStr);

				const authorizedPortion = AuthorizedPortion.findAuthorizedPortion(AuthorizedPortion.RecordType.AUTH, authorityRecordField);
				const resultingField = AuthorizedPortion.updateAuthorizedPortion(AuthorizedPortion.RecordType.AUTH, linkedAuthorityRecordField, authorizedPortion);
				const resultingFieldAfterSecondApplication = AuthorizedPortion.updateAuthorizedPortion(AuthorizedPortion.RecordType.AUTH, resultingField, authorizedPortion);

				expect(fieldToString(resultingFieldAfterSecondApplication)).to.equal(expectedFieldStr);
			});
		});
	});

	describe('findAuthorizedPortion', () => {
		describe('for BIB records', () => {
			it('should return the found authorized portion', () => {
				const bibRecordField = stringToField('100 0  ‡aNimi,‡d1922-1999');
				const authorizedPortion = AuthorizedPortion.findAuthorizedPortion(AuthorizedPortion.RecordType.BIB, bibRecordField);
				expect(authorizedPortion).to.eql({
					tag: '100',
					ind1: '0',
					subfields: [
						{code: 'a', value: 'Nimi,'},
						{code: 'd', value: '1922-1999'}
					],
					range: {start: 0, length: 2},
					specifier: null,
					titlePortion: null
				});
			});

			it('should not pick control subfields into the authorized portion', () => {
				const bibRecordField = stringToField('100 0  ‡aNimi,‡d1922-1999‡8123‡6jee');
				const authorizedPortion = AuthorizedPortion.findAuthorizedPortion(AuthorizedPortion.RecordType.BIB, bibRecordField);
				expect(authorizedPortion).to.eql({
					tag: '100',
					ind1: '0',
					subfields: [
						{code: 'a', value: 'Nimi,'},
						{code: 'd', value: '1922-1999'}
					],
					range: {start: 0, length: 2},
					specifier: null,
					titlePortion: null
				});
			});

			it('should not pick 0 subfield into the authorized portion', () => {
				const bibRecordField = stringToField('100 0  ‡aNimi,‡d1922-1999‡0(TST10)1234');
				const authorizedPortion = AuthorizedPortion.findAuthorizedPortion(AuthorizedPortion.RecordType.BIB, bibRecordField);
				expect(authorizedPortion).to.eql({
					tag: '100',
					ind1: '0',
					subfields: [
						{code: 'a', value: 'Nimi,'},
						{code: 'd', value: '1922-1999'}
					],
					range: {start: 0, length: 2},
					specifier: null,
					titlePortion: null

				});
			});

			it('should not pick non-authorized subfields into the authorized portion', () => {
				const bibRecordField = stringToField('600 0  ‡3jotain‡aNimi,‡d1922-1999');
				const authorizedPortion = AuthorizedPortion.findAuthorizedPortion(AuthorizedPortion.RecordType.BIB, bibRecordField);
				expect(authorizedPortion).to.eql({
					tag: '600',
					ind1: '0',
					subfields: [
						{code: 'a', value: 'Nimi,'},
						{code: 'd', value: '1922-1999'}
					],
					range: {start: 1, length: 2},
					specifier: null,
					titlePortion: null
				});
			});

			// TODO: note - no punctuation fix here
			it('should not pick non-authorized subfields into the authorized portion ($e, $9)', () => {
				const authorityRecordField = stringToField('100 0  ‡aNimi,‡d1922-1999,‡etoimittaja');
				const authorizedPortion = AuthorizedPortion.findAuthorizedPortion(AuthorizedPortion.RecordType.AUTH, authorityRecordField);
				expect(authorizedPortion).to.eql({
					tag: '100',
					ind1: '0',
					subfields: [
						{code: 'a', value: 'Nimi,'},
						{code: 'd', value: '1922-1999,'}
					],
					range: {start: 0, length: 2},
					specifier: null,
					titlePortion: null
				});
			});

			it('should pick the specifier', () => {
				const bibRecordField = stringToField('710 2  ‡aLääketieteellisen fysiikan & tekniikan yhdistys. ‡bProgress report -meeting,‡n(1 :‡d1979) ‡ejulkaisija. ‡0(TST10)123345');
				const authorizedPortion = AuthorizedPortion.findAuthorizedPortion(AuthorizedPortion.RecordType.BIB, bibRecordField);
				expect(authorizedPortion).to.eql({
					tag: '710',
					ind1: '2',
					subfields: [
						{code: 'a', value: 'Lääketieteellisen fysiikan & tekniikan yhdistys. '},
						{code: 'b', value: 'Progress report -meeting,'}
					],
					range: {start: 0, length: 2},
					specifier: {
						range: {start: 2, length: 2},
						subfields: [
							{code: 'n', value: '(1 :'},
							{code: 'd', value: '1979) '}
						]
					},
					titlePortion: null
				});
			});
		});

		describe('for AUTH records', () => {
			it('should return the found authorized portion', () => {
				const authorityRecordField = stringToField('100 0  ‡aNimi,‡d1922-1999');
				const authorizedPortion = AuthorizedPortion.findAuthorizedPortion(AuthorizedPortion.RecordType.AUTH, authorityRecordField);
				expect(authorizedPortion).to.eql({
					tag: '100',
					ind1: '0',
					subfields: [
						{code: 'a', value: 'Nimi,'},
						{code: 'd', value: '1922-1999'}
					],
					range: {start: 0, length: 2},
					specifier: null,
					titlePortion: null
				});
			});

			it('should not pick control subfields into the authorized portion', () => {
				const authorityRecordField = stringToField('100 0  ‡aNimi,‡d1922-1999‡8123‡6jee');
				const authorizedPortion = AuthorizedPortion.findAuthorizedPortion(AuthorizedPortion.RecordType.AUTH, authorityRecordField);
				expect(authorizedPortion).to.eql({
					tag: '100',
					ind1: '0',
					subfields: [
						{code: 'a', value: 'Nimi,'},
						{code: 'd', value: '1922-1999'}
					],
					range: {start: 0, length: 2},
					specifier: null,
					titlePortion: null
				});
			});

			it('should not pick 0 subfield into the authorized portion', () => {
				const authorityRecordField = stringToField('100 0  ‡aNimi,‡d1922-1999‡0(TST10)1234');
				const authorizedPortion = AuthorizedPortion.findAuthorizedPortion(AuthorizedPortion.RecordType.AUTH, authorityRecordField);
				expect(authorizedPortion).to.eql({
					tag: '100',
					ind1: '0',
					subfields: [
						{code: 'a', value: 'Nimi,'},
						{code: 'd', value: '1922-1999'}
					],
					range: {start: 0, length: 2},
					specifier: null,
					titlePortion: null

				});
			});

			it('should not pick non-authorized subfields into the authorized portion', () => {
				const authorityRecordField = stringToField('500 0  ‡ijotain‡aNimi,‡d1922-1999');
				const authorizedPortion = AuthorizedPortion.findAuthorizedPortion(AuthorizedPortion.RecordType.AUTH, authorityRecordField);
				expect(authorizedPortion).to.eql({
					tag: '500',
					ind1: '0',
					subfields: [
						{code: 'a', value: 'Nimi,'},
						{code: 'd', value: '1922-1999'}
					],
					range: {start: 1, length: 2},
					specifier: null,
					titlePortion: null
				});
			});

			it('should pick the specifier', () => {
				const authorityRecordField = stringToField('110 2  ‡aLääketieteellisen fysiikan & tekniikan yhdistys. ‡bProgress report -meeting,‡n(1 :‡d1979) ‡ejulkaisija. ‡0(TST10)123345');
				const authorizedPortion = AuthorizedPortion.findAuthorizedPortion(AuthorizedPortion.RecordType.BIB, authorityRecordField);
				expect(authorizedPortion).to.eql({
					tag: '110',
					ind1: '2',
					subfields: [
						{code: 'a', value: 'Lääketieteellisen fysiikan & tekniikan yhdistys. '},
						{code: 'b', value: 'Progress report -meeting,'}
					],
					range: {start: 0, length: 2},
					specifier: {
						range: {start: 2, length: 2},
						subfields: [
							{code: 'n', value: '(1 :'},
							{code: 'd', value: '1979) '}
						]
					},
					titlePortion: null
				});
			});

			it('should pick the title portion', () => {
				const authorityRecordField = stringToField('110 2  ‡aLääketieteellisen fysiikan & tekniikan yhdistys. ‡bProgress report -meeting,‡n(1 :‡d1979) ‡ejulkaisija. ‡ttitleportion‡0(TST10)123345');
				const authorizedPortion = AuthorizedPortion.findAuthorizedPortion(AuthorizedPortion.RecordType.BIB, authorityRecordField);
				expect(authorizedPortion).to.eql({
					tag: '110',
					ind1: '2',
					subfields: [
						{code: 'a', value: 'Lääketieteellisen fysiikan & tekniikan yhdistys. '},
						{code: 'b', value: 'Progress report -meeting,'}
					],
					range: {start: 0, length: 2},
					specifier: {
						range: {start: 2, length: 2},
						subfields: [
							{code: 'n', value: '(1 :'},
							{code: 'd', value: '1979) '}
						]
					},
					titlePortion: {
						range: {start: 5, length: 1},
						subfields: [{code: 't', value: 'titleportion'}]
					}
				});
			});

			it('should separate the specifier and title portion fields', () => {
				const authorityRecordField = stringToField('110 2  ‡aLääketieteellisen fysiikan & tekniikan yhdistys‡nn-in-specifier‡ttitleportion‡nn-in-title');
				const authorizedPortion = AuthorizedPortion.findAuthorizedPortion(AuthorizedPortion.RecordType.BIB, authorityRecordField);
				expect(authorizedPortion).to.eql({
					tag: '110',
					ind1: '2',
					subfields: [
						{code: 'a', value: 'Lääketieteellisen fysiikan & tekniikan yhdistys'}
					],
					range: {start: 0, length: 1},
					specifier: {
						range: {start: 1, length: 1},
						subfields: [
							{code: 'n', value: 'n-in-specifier'}
						]
					},
					titlePortion: {
						range: {start: 2, length: 2},
						subfields: [
							{code: 't', value: 'titleportion'},
							{code: 'n', value: 'n-in-title'}
						]
					}
				});
			});
		});
	});
});
