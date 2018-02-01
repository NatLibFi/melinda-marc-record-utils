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

/*
Bib-tietueen auktorisoituja muotoja sisältävät kentät
------------------------------------------------------

100, 600, 700, 800 - henkilöt, auktoriteettitietueet, joissa 100 -kenttä
X00:
nimiosuus: $a, $b, $c, $d, $g (jos ennen $t:tä), $j, $q
funktio: $e, $4
organisatorinen kytkös: $u
nimekeosuus: $f, $g (jos $t:n jälkeen), $h, $k, $l, $m, $n, $o, $p, $r, $s, $t, $v, $x, $y, $z
kontrolliosakentät: $0, $2, $6, $8, $9
aineiston osa: $3

110, 610, 710, 810 - yhteisöt, auktoriteettitietueet, joissa 110 -kenttä
X10:
nimiosuus: $a, $b, $c, $d, $g (jos ennen $t:tä), $n
funktio: $e, $4
nimekeosuus: $f, $g (jos $t:n jälkeen), $k, $l, $p, $t,
organisatorinen kytkös: $u
kontrolliosakentät: $0, $2, $6, $8, $9
aineiston osa: $3

111, 611, 711, 811 - kokoukset, auktoriteettitietueet, joissa 111 -kenttä
X11:
nimiosuus: $a, $c, $d, $e, $g (jos ennen $t:tä), $n (jos ennen $t:tä), $q,
funktio: $j, $4
nimekeosuus: $f, $g (jos $t:n jälkeen), $k, $l, $n (jos $t:n jälkeen), $t
organisatorinen kytkös: $u
kontrolliosakentät: $0, $2, $6, $8, $9
aineiston osa: $3

6XX vain jos 2. indikaattori on 4 tai (toinen indikaattori on 7 ja on osakenttä $2:n sisältö on ysa).

(130, 630, 730, 830 - yhtenäistetyt nimekkeet, auktoriteettitietueet, joissa 130 -kenttä)
(647, 648, 650, 651, 655 - asiasanoja, auktoriteettitietueet, joissa vastaavat 1XX -kentät)
*/

// This is not to be used in the fenni migration for setting any values.

import curry from 'lodash/curry';
import findLastIndex from 'lodash/findLastIndex';
import includes from 'lodash/includes';
import cloneDeep from 'lodash/cloneDeep';
import RecordType from './record-type';
import isTitlePortionSubfield from './is-title-portion-subfield';

export default function findAuthorizedPortion(recordType, recordField) {
	if (recordType === RecordType.AUTH) {
		const isTitlePortion = curry(isTitlePortionSubfield)(recordField);
		const titlePortionStart = recordField.subfields.findIndex(isTitlePortion);
		const hasTitlePortion = titlePortionStart !== -1;
		const titlePortionEnd = findLastIndex(recordField.subfields, isTitlePortion);
		const titlePortionLength = titlePortionEnd - titlePortionStart + 1;

		let isSpecifierSubfield;
		switch (recordField.tag) {
			case '110':
				isSpecifierSubfield = sub => includes(['c', 'd', 'g', 'n'], sub.code) && !isTitlePortion(sub);
				break;
			case '610':
				isSpecifierSubfield = sub => includes(['c', 'd', 'g', 'n'], sub.code) && !isTitlePortion(sub);
				break;
			case '710':
				isSpecifierSubfield = sub => includes(['c', 'd', 'g', 'n'], sub.code) && !isTitlePortion(sub);
				break;
			case '111':
				isSpecifierSubfield = sub => includes(['c', 'd', 'g', 'n'], sub.code) && !isTitlePortion(sub);
				break;
			case '611':
				isSpecifierSubfield = sub => includes(['c', 'd', 'g', 'n'], sub.code) && !isTitlePortion(sub);
				break;
			case '711':
				isSpecifierSubfield = sub => includes(['c', 'd', 'g', 'n'], sub.code) && !isTitlePortion(sub);
				break;

			default: isSpecifierSubfield = () => false;
		}

    // $e, $j and $9 marked as non-authorized to keep them from duplicating in bibs
		let isAuthorizedSubfield;
		switch (recordField.tag) {
			case '100':
				isAuthorizedSubfield = sub => !includes(['e', '6', '8', '9', '0'], sub.code) && !isSpecifierSubfield(sub) && !isTitlePortion(sub);
				break;
			case '110':
				isAuthorizedSubfield = sub => !includes(['e', '6', '8', '9', '0'], sub.code) && !isSpecifierSubfield(sub) && !isTitlePortion(sub);
				break;
			case '111':
				isAuthorizedSubfield = sub => !includes(['j', '6', '8', '9', '0'], sub.code) && !isSpecifierSubfield(sub) && !isTitlePortion(sub);
				break;
			case '500':
				isAuthorizedSubfield = sub => !includes(['i', 'w', '4', '5', '6', '8', '9', '0'], sub.code) && !isSpecifierSubfield(sub) && !isTitlePortion(sub);
				break;
			case '510':
				isAuthorizedSubfield = sub => !includes(['i', 'w', '4', '5', '6', '8', '9', '0'], sub.code) && !isSpecifierSubfield(sub) && !isTitlePortion(sub);
				break;
			case '511':
				isAuthorizedSubfield = sub => !includes(['i', 'w', '4', '5', '6', '8', '9', '0'], sub.code) && !isSpecifierSubfield(sub) && !isTitlePortion(sub);
				break;
			case '700':
				isAuthorizedSubfield = sub => !includes(['i', 'w', '4', '0'], sub.code) && !isSpecifierSubfield(sub) && !isTitlePortion(sub);
				break;
			case '710':
				isAuthorizedSubfield = sub => !includes(['i', 'w', '4', '0'], sub.code) && !isSpecifierSubfield(sub) && !isTitlePortion(sub);
				break;
			case '711':
				isAuthorizedSubfield = sub => !includes(['i', 'w', '4', '0'], sub.code) && !isSpecifierSubfield(sub) && !isTitlePortion(sub);
				break;

			default: throw new Error(`Could not find authorized portion for field ${recordField.tag}`);
		}

		const specifierPortionStart = recordField.subfields.findIndex(isSpecifierSubfield);
		const hasSpecifier = specifierPortionStart !== -1;
		const specifierPortionEnd = findLastIndex(recordField.subfields, isSpecifierSubfield);
		const specifierPortionLength = specifierPortionEnd - specifierPortionStart + 1;

		let authorizedPortionStart = recordField.subfields.findIndex(isAuthorizedSubfield);
		authorizedPortionStart = authorizedPortionStart === -1 ? 0 : authorizedPortionStart;
		const authorizedPortionEnd = findLastIndex(recordField.subfields, isAuthorizedSubfield);
		const authorizedPortionLength = authorizedPortionEnd - authorizedPortionStart + 1;

		if (!recordField.subfields.slice(authorizedPortionStart, authorizedPortionEnd + 1).every(isAuthorizedSubfield)) {
			throw new Error('Field contains extra fields in the middle of authorized portion');
		}

		return {
			ind1: recordField.ind1,
			tag: recordField.tag,
			subfields: cloneDeep(recordField.subfields).filter(isAuthorizedSubfield),
			range: {
				start: authorizedPortionStart,
				length: authorizedPortionLength
			},
			specifier: hasSpecifier ? {
				range: {
					start: specifierPortionStart,
					length: specifierPortionLength
				},
				subfields: cloneDeep(recordField.subfields).filter(isSpecifierSubfield)
			} : null,
			titlePortion: hasTitlePortion ? {
				range: {
					start: titlePortionStart,
					length: titlePortionLength
				},
				subfields: cloneDeep(recordField.subfields).filter(isTitlePortion)
			} : null
		};
	}
	if (recordType === RecordType.BIB) {
		const isTitlePortion = curry(isTitlePortionSubfield)(recordField);
		const titlePortionStart = recordField.subfields.findIndex(isTitlePortion);
		const hasTitlePortion = titlePortionStart !== -1;
		const titlePortionEnd = findLastIndex(recordField.subfields, isTitlePortion);
		const titlePortionLength = titlePortionEnd - titlePortionStart + 1;

		let isAuthorizedSubfield;
		switch (recordField.tag) {
			case '100':
				isAuthorizedSubfield = sub => includes(['a', 'b', 'c', 'd', 'g', 'j', 'q'], sub.code) && !isTitlePortion(sub);
				break;
			case '600':
				isAuthorizedSubfield = sub => includes(['a', 'b', 'c', 'd', 'g', 'j', 'q'], sub.code) && !isTitlePortion(sub);
				break;
			case '700':
				isAuthorizedSubfield = sub => includes(['a', 'b', 'c', 'd', 'g', 'j', 'q'], sub.code) && !isTitlePortion(sub);
				break;
			case '800':
				isAuthorizedSubfield = sub => includes(['a', 'b', 'c', 'd', 'g', 'j', 'q'], sub.code) && !isTitlePortion(sub);
				break;
			case '110':
				isAuthorizedSubfield = sub => includes(['a', 'b'], sub.code);
				break;
			case '610':
				isAuthorizedSubfield = sub => includes(['a', 'b'], sub.code);
				break;
			case '710':
				isAuthorizedSubfield = sub => includes(['a', 'b'], sub.code);
				break;
			case '810':
				isAuthorizedSubfield = sub => includes(['a', 'b'], sub.code);
				break;
			case '111':
				isAuthorizedSubfield = sub => includes(['a', 'e', 'q'], sub.code);
				break;
			case '611':
				isAuthorizedSubfield = sub => includes(['a', 'e', 'q'], sub.code);
				break;
			case '711':
				isAuthorizedSubfield = sub => includes(['a', 'e', 'q'], sub.code);
				break;
			case '811':
				isAuthorizedSubfield = sub => includes(['a', 'e', 'q'], sub.code);
				break;

			default: throw new Error(`Could not find authorized portion for field ${recordField.tag}`);
		}

		let isSpecifierSubfield;
		switch (recordField.tag) {
			case '110':
				isSpecifierSubfield = sub => includes(['c', 'd', 'g', 'n'], sub.code) && !isTitlePortion(sub);
				break;
			case '610':
				isSpecifierSubfield = sub => includes(['c', 'd', 'g', 'n'], sub.code) && !isTitlePortion(sub);
				break;
			case '710':
				isSpecifierSubfield = sub => includes(['c', 'd', 'g', 'n'], sub.code) && !isTitlePortion(sub);
				break;
			case '810':
				isSpecifierSubfield = sub => includes(['c', 'd', 'g', 'n'], sub.code) && !isTitlePortion(sub);
				break;
			case '111':
				isSpecifierSubfield = sub => includes(['c', 'd', 'g', 'n'], sub.code) && !isTitlePortion(sub);
				break;
			case '611':
				isSpecifierSubfield = sub => includes(['c', 'd', 'g', 'n'], sub.code) && !isTitlePortion(sub);
				break;
			case '711':
				isSpecifierSubfield = sub => includes(['c', 'd', 'g', 'n'], sub.code) && !isTitlePortion(sub);
				break;
			case '811':
				isSpecifierSubfield = sub => includes(['c', 'd', 'g', 'n'], sub.code) && !isTitlePortion(sub);
				break;

			default: isSpecifierSubfield = () => false;
		}

		let authorizedPortionStart = recordField.subfields.findIndex(isAuthorizedSubfield);
		authorizedPortionStart = authorizedPortionStart === -1 ? 0 : authorizedPortionStart;
		const authorizedPortionEnd = findLastIndex(recordField.subfields, isAuthorizedSubfield);
		const authorizedPortionLength = authorizedPortionEnd - authorizedPortionStart + 1;

		if (!recordField.subfields.slice(authorizedPortionStart, authorizedPortionEnd + 1).every(isAuthorizedSubfield)) {
			throw new Error('Field contains extra fields in the middle of authorized portion');
		}

		const specifierPortionStart = recordField.subfields.findIndex(isSpecifierSubfield);
		const hasSpecifier = specifierPortionStart !== -1;
		const specifierPortionEnd = findLastIndex(recordField.subfields, isSpecifierSubfield);
		const specifierPortionLength = specifierPortionEnd - specifierPortionStart + 1;

		return {
			ind1: recordField.ind1,
			tag: recordField.tag,
			subfields: cloneDeep(recordField.subfields).filter(isAuthorizedSubfield),
			range: {
				start: authorizedPortionStart,
				length: authorizedPortionLength
			},
			specifier: hasSpecifier ? {
				range: {
					start: specifierPortionStart,
					length: specifierPortionLength
				},
				subfields: cloneDeep(recordField.subfields).filter(isSpecifierSubfield)
			} : null,
			titlePortion: hasTitlePortion ? {
				range: {
					start: titlePortionStart,
					length: titlePortionLength
				},
				subfields: cloneDeep(recordField.subfields).filter(isTitlePortion)
			} : null
		};
	}
	throw new Error(`Invalid record type ${recordType}`);
}
