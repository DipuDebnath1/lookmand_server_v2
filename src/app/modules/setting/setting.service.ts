/* eslint-disable @typescript-eslint/no-explicit-any */
import { IDocument } from './document.interface';
import Document from './document.model';

// update document
const getDocument = async (name: string) => {
  let document: any;
  document = await Document.findOne({ name }).select('-isDeleted -__v -name');
  if (!document)
    document = await Document.create({
      name,
      title: name,
      content: `${name} document is cooking ...`,
    });
  return document;
};

// update document
const updateDocument = async (name: string, payload: Partial<IDocument>) => {
  let document: any;

  document = await Document.findOne({ name }).select('-isDeleted -__v');
  if (document) {
    Object.assign(document, payload);
    await document.save();
    return document;
  }
  document = await Document.create({ name, ...payload });
  return document;
};

const settingService = { getDocument, updateDocument };
export default settingService;
