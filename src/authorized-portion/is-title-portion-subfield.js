import dropWhile from 'lodash/dropWhile';
import includes from 'lodash/includes';
import find from 'lodash/find';
import isEqual from 'lodash/isEqual';

export default function isTitlePortionSubfield(field, subfield) {
	const subfieldsAfterT = dropWhile(field.subfields, sub => sub.code !== 't');
	if (!find(subfieldsAfterT, afterT => isEqual(afterT, subfield))) {
		return false;
	}

	switch (field.tag) {
		case '100': return includes(['f', 'g', 'h', 'k', 'l', 'm', 'o', 'r', 's', 't', 'v', 'x', 'y', 'z', 'p', 't', 'd', 'g', 'n'], subfield.code);
		case '600': return includes(['f', 'g', 'h', 'k', 'l', 'm', 'o', 'r', 's', 't', 'v', 'x', 'y', 'z', 'p', 't', 'd', 'g', 'n'], subfield.code);
		case '700': return includes(['f', 'g', 'h', 'k', 'l', 'm', 'o', 'r', 's', 't', 'v', 'x', 'y', 'z', 'p', 't', 'd', 'g', 'n'], subfield.code);
		case '800': return includes(['f', 'g', 'h', 'k', 'l', 'm', 'o', 'r', 's', 't', 'v', 'x', 'y', 'z', 'p', 't', 'd', 'g', 'n'], subfield.code);

		case '110': return includes(['f', 'k', 'l', 'p', 't', 'd', 'g', 'n'], subfield.code);
		case '610': return includes(['f', 'h', 'k', 'l', 'm', 'o', 'p', 'r', 's', 't', 'd', 'g', 'n'], subfield.code);
		case '710': return includes(['f', 'h', 'k', 'l', 'm', 'o', 'p', 'r', 's', 't', 'd', 'g', 'n'], subfield.code);
		case '810': return includes(['f', 'h', 'k', 'l', 'm', 'o', 'p', 'r', 's', 't', 'd', 'g', 'n'], subfield.code);

		case '111': return includes(['f', 'k', 'l', 'p', 't', 'g', 'n'], subfield.code);
		case '611': return includes(['f', 'h', 'k', 'l', 'p', 's', 't', 'g', 'n'], subfield.code);
		case '711': return includes(['f', 'h', 'k', 'l', 'p', 's', 't', 'g', 'n'], subfield.code);
		case '811': return includes(['f', 'h', 'k', 'l', 'p', 's', 't', 'g', 'n'], subfield.code);

		default: return false;
	}
}
