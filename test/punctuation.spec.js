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

import includes from 'lodash/includes';
import {expect} from 'chai';
import {Punctuation, fieldToString, stringToField} from '../src/index';

const bibRules = Punctuation.readPunctuationRulesFromJSON(require('../src/punctuation/bib-punctuation.json'));
const authRules = Punctuation.readPunctuationRulesFromJSON(require('../src/punctuation/auth-punctuation.json'));

describe('fixPunctuation', () => {
	const fixPunctuationFromBibField = Punctuation.createRecordFixer(bibRules);
	const fixPunctuationFromAuthField = Punctuation.createRecordFixer(authRules, Punctuation.RecordTypes.AUTHORITY);

	const authorityRecordTests = [
		[
			'100 1  ‡aRosberg, Harri',
			'100 1  ‡aRosberg, Harri'
		],
		[
			'100 1  ‡aRosberg, H.',
			'100 1  ‡aRosberg, H.'
		],
		[
			'100 1  ‡aRosberg, Harri‡d1946-',
			'100 1  ‡aRosberg, Harri,‡d1946-'
		],
		[
			'700 1  ‡aLindstedt, Juha P.‡d1962-',
			'700 1  ‡aLindstedt, Juha P.,‡d1962-'
		],
		[
			'100 1  ‡aRosberg, Harri‡d1946-‡0(FIN11)123',
			'100 1  ‡aRosberg, Harri,‡d1946-‡0(FIN11)123'
		],
		[
			'110 1  ‡aRosberg, Harri‡dabc‡0(FIN11)123',
			'110 1  ‡aRosberg, Harri‡dabc‡0(FIN11)123'
		],
		[
			'111 1  ‡aRosberg, Harri‡dabc‡0(FIN11)123',
			'111 1  ‡aRosberg, Harri‡dabc‡0(FIN11)123'
		],
		[
			'800 1  ‡aRosberg, Harri‡dabc‡0(FIN11)123',
			'800 1  ‡aRosberg, Harri‡dabc‡0(FIN11)123'
		],
		[
			'500 1  ‡iToinen identiteetti:‡aRosberg, Harri,‡dabc‡0(FIN11)123',
			'500 1  ‡iToinen identiteetti:‡aRosberg, Harri,‡dabc‡0(FIN11)123'
		],
		
	];

	const bibRecordTests = [
		[
			'100 1  ‡aRosberg, Harri',
			'100 1  ‡aRosberg, Harri.'
		],
		[
			'100 1  ‡aRosas, Allan‡d1948-‡ekirjoittaja.',
			'100 1  ‡aRosas, Allan,‡d1948-‡ekirjoittaja.'
		],
		[
			'100 1  ‡aRosas, Allan‡d1948-1998‡ekirjoittaja.',
			'100 1  ‡aRosas, Allan,‡d1948-1998,‡ekirjoittaja.'
		],
		[
			'100 1  ‡aRonning, Mirja‡ekirjoittaja.',
			'100 1  ‡aRonning, Mirja,‡ekirjoittaja.'
		],
		[
			'100 1  ‡aRonning, Mirja,‡ekirjoittaja.',
			'100 1  ‡aRonning, Mirja,‡ekirjoittaja.'
		],
		[
			'100 1  ‡aRonning, Mirja.',
			'100 1  ‡aRonning, Mirja.'
		],
		[
			'700 12 ‡aRentola, Kimmo‡d1953-‡ekirjoittaja‡tWhen to move?',
			'700 12 ‡aRentola, Kimmo,‡d1953-‡ekirjoittaja.‡tWhen to move?'
		],
		[
			'700 1  ‡aPaavali,‡carkkipiispa‡ekääntäjä.',
			'700 1  ‡aPaavali,‡carkkipiispa,‡ekääntäjä.'
		],
		[
			'100 1  ‡aRoberts, Charles G. D.‡d1860-1943',
			'100 1  ‡aRoberts, Charles G. D.,‡d1860-1943.'
		],
		[
			'700 1  ‡aBelski, L. P.‡ekääntäjä.',
			'700 1  ‡aBelski, L. P.,‡ekääntäjä.'
		],
		[
			'700 1  ‡aLindstedt, Juha P.‡d1962-',
			'700 1  ‡aLindstedt, Juha P.,‡d1962-'
		],
		[
			'110 1  ‡aTeknillinen korkeakoulu‡bSähkömekaniikan laboratiorio',
			'110 1  ‡aTeknillinen korkeakoulu.‡bSähkömekaniikan laboratiorio.'
		],
		[
			'110 1  ‡aTeknillinen korkeakoulu.‡bSähkömekaniikan laboratiorio',
			'110 1  ‡aTeknillinen korkeakoulu.‡bSähkömekaniikan laboratiorio.'
		],
		[
			'100 1  ‡aRonning, Mirja,‡c(Iso)‡d1962-',
			'100 1  ‡aRonning, Mirja,‡c(Iso),‡d1962-'
		],
		[
			'100 1  ‡aRonning, Mirja,‡c(Iso)',
			'100 1  ‡aRonning, Mirja,‡c(Iso)'
		],
		[
			'110 2  ‡aKehitysaluerahasto‡9FENNI<KEEP>',
			'110 2  ‡aKehitysaluerahasto.‡9FENNI<KEEP>'
		],
		[
			'110 2  ‡aKehitysaluerahasto‡0(FIN11)234897234',
			'110 2  ‡aKehitysaluerahasto.‡0(FIN11)234897234'
		],
		[
			'100 1  ‡aRonning, Mirja‡q[Mirjami]',
			'100 1  ‡aRonning, Mirja‡q[Mirjami]'
		],
		[
			'100 1  ‡aRonning, Mirja‡q(Mirjami)',
			'100 1  ‡aRonning, Mirja‡q(Mirjami)'
		],
		[
			'100 1  ‡aRonning, Mirja‡q(Mirjami)‡ekirjoittaja',
			'100 1  ‡aRonning, Mirja‡q(Mirjami),‡ekirjoittaja.'
		],
		[
			'100 12 ‡aMatti Meikäläinen‡bb-osakentt',
			'100 12 ‡aMatti Meikäläinen‡bb-osakentt.'
		],
		[
			'100 12 ‡aMatti Meikäläinen‡cb-osakentt',
			'100 12 ‡aMatti Meikäläinen,‡cb-osakentt.'
		],
		[
			'100 12 ‡aMatti Meikäläinen‡csub1‡esub2',
			'100 12 ‡aMatti Meikäläinen,‡csub1,‡esub2.'
		],
		[
			'100 12 ‡aMatti Meikäläinen‡csub1',
			'100 12 ‡aMatti Meikäläinen,‡csub1.'
		],
		[
			'100 12 ‡aMatti Meikäläinen‡csub1‡csub2',
			'100 12 ‡aMatti Meikäläinen,‡csub1,‡csub2.'
		],
		[
			'100 12 ‡aMatti Meikäläinen,‡csub1‡csub2',
			'100 12 ‡aMatti Meikäläinen,‡csub1,‡csub2.'
		],
		[
			'100 12 ‡aMatti Meikäläinen-‡esub1.',
			'100 12 ‡aMatti Meikäläinen-‡esub1.'
		],
		[
			'100 12 ‡aMatti Meikäläinen‡esub1.',
			'100 12 ‡aMatti Meikäläinen,‡esub1.'
		],
		[
			'100 12 ‡aMatti Meikäläinen,‡esäveltäjä',
			'100 12 ‡aMatti Meikäläinen,‡esäveltäjä.'
		],
		[
			'110 12 ‡aKehitysaluerahasto‡csub1‡csub2',
			'110 12 ‡aKehitysaluerahasto,‡csub1 ;‡csub2.'
		],
		[
			'110 12 ‡aKehitysaluerahasto‡dsub1‡csub2',
			'110 12 ‡aKehitysaluerahasto‡dsub1 :‡csub2.'
		],
		[
			'100 12 ‡aMatti Meikäläinen‡bb-osakentt‡khöyry‡pding‡8controllia',
			'100 12 ‡aMatti Meikäläinen‡bb-osakentt.‡khöyry‡pding.‡8controllia'
		],
		[
			'100 12 ‡aMatti Meikäläinen‡4dir',
			'100 12 ‡aMatti Meikäläinen.‡4dir'
		],
		[
			'700 12 ‡iJulkaistu aiemmin:‡aHietamies, Laila,‡d1938-‡ekirjoittaja.‡tMyrskypilvet.',
			'700 12 ‡iJulkaistu aiemmin:‡aHietamies, Laila,‡d1938-‡ekirjoittaja.‡tMyrskypilvet.'
		],
		[
			'600 14 ‡aHämäläinen, Helvi‡d1907-1998‡xhenkilöhistoria.',
			'600 14 ‡aHämäläinen, Helvi,‡d1907-1998‡xhenkilöhistoria.'
		],
		[
			'700 1  ‡aTopelius, Zacharias‡d1818-1898‡tLjungblommor.‡nI‡f1845.',
			'700 1  ‡aTopelius, Zacharias,‡d1818-1898.‡tLjungblommor.‡nI.‡f1845.'
		],
		[
			'700 1  ‡aTopelius, Zacharias‡d1818-1898,',
			'700 1  ‡aTopelius, Zacharias,‡d1818-1898,'
		],
		[
			'700 1  ‡aAaltonen, Toini,‡d1906-1983‡0(FI-ASTERI-N)000039785',
			'700 1  ‡aAaltonen, Toini,‡d1906-1983.‡0(FI-ASTERI-N)000039785'
		]
	];

	describe('for authority records', () => {
		authorityRecordTests.forEach(testCase => {
			const [from, to, options] = testCase;

			const testDescriptionFn = options && includes(options, '!') ? it.only : it;

			testDescriptionFn(`should convert ${from} to ${to}`, () => {
				const field = stringToField(from);
				fixPunctuationFromAuthField(field);
				expect(fieldToString(field)).to.equal(to);
			});
		});
	});

	describe('for bibliographic records', () => {
		bibRecordTests.forEach(testCase => {
			const [from, to, options] = testCase;
			const testDescriptionFn = options && includes(options, '!') ? it.only : it;

			testDescriptionFn(`should convert ${from} to ${to}`, () => {
				const field = stringToField(from);
				fixPunctuationFromBibField(field);
				expect(fieldToString(field)).to.equal(to);
			});
		});
	});
});
