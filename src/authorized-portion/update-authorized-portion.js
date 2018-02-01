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

import cloneDeep from 'lodash/cloneDeep';
import createDebug from 'debug';
import fieldToString from '../field-to-string';
import RecordType from './record-type';
import findAuthorizedPortion from './find-authorized-portion';

const debug = createDebug('authorized-portion');

// This is not to be used in the fenni migration!
export default function updateAuthorizedPortion(recordType, recordField, authorizedPortion) {
	if (recordType === RecordType.AUTH) {
		const currentAuthorizedPortion = findAuthorizedPortion(recordType, recordField);

		const updatedRecordField = cloneDeep(recordField);
		updatedRecordField.subfields.splice.bind(updatedRecordField.subfields, currentAuthorizedPortion.range.start, currentAuthorizedPortion.range.length).apply(null, cloneDeep(authorizedPortion.subfields));
		updatedRecordField.ind1 = authorizedPortion.ind1;

    // Update tag series
		const tagSeries = tag => tag.substr(1);
		if (tagSeries(recordField.tag) !== tagSeries(authorizedPortion.tag)) {
			updatedRecordField.tag = updatedRecordField.tag.substr(0, 1) + tagSeries(authorizedPortion.tag);
		}

		return updatedRecordField;
	}
	if (recordType === RecordType.BIB) {
		const currentAuthorizedPortion = findAuthorizedPortion(recordType, recordField);
		debug('currentAuthorizedPortion in bib record', currentAuthorizedPortion);
		debug('Authroized portion from authority record', authorizedPortion);

		const updatedRecordField = cloneDeep(recordField);
		updatedRecordField.subfields.splice.bind(updatedRecordField.subfields, currentAuthorizedPortion.range.start, currentAuthorizedPortion.range.length).apply(null, cloneDeep(authorizedPortion.subfields));
		updatedRecordField.ind1 = authorizedPortion.ind1;
		debug('before update', fieldToString(recordField));
		debug('after update ', fieldToString(updatedRecordField));

    // Update tag series
		const tagSeries = tag => tag.substr(1);
		if (tagSeries(recordField.tag) !== tagSeries(authorizedPortion.tag)) {
			updatedRecordField.tag = updatedRecordField.tag.substr(0, 1) + tagSeries(authorizedPortion.tag);
		}

    // Update specifier portion if authorizedPortion contains it.
		if (authorizedPortion.specifier && authorizedPortion.specifier.range.length > 0) {
      // Find the authorized portion again since the ranges may change after fields are updated.
			const updatedAuthorizedPortion = findAuthorizedPortion(recordType, updatedRecordField);

      // Remove specifier (if any) from current record
			if (updatedAuthorizedPortion.specifier && authorizedPortion.specifier.range.length > 0) {
				updatedRecordField.subfields.splice(updatedAuthorizedPortion.specifier.range.start, updatedAuthorizedPortion.specifier.range.length);
			}
			const updatedAuthorizedPortionWithoutSpecifier = findAuthorizedPortion(recordType, updatedRecordField);

			const specifierStartPosition = updatedAuthorizedPortionWithoutSpecifier.range.start + updatedAuthorizedPortionWithoutSpecifier.range.length;
			updatedRecordField.subfields.splice(specifierStartPosition, 0, ...authorizedPortion.specifier.subfields);
		}

		return updatedRecordField;
	}
	throw new Error(`Invalid record type ${recordType}`);
}
