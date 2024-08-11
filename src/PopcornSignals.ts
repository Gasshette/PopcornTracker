import { Signal } from 'typed-signals';
import { DocumentResponse } from './types/Document';

export class PopcornSignals {
  static syncSignal = new Signal<(response: DocumentResponse) => void>();
  static initSignal = new Signal<() => void>();
  static setItemsSignal = new Signal<() => void>();
  static setConfigSignal = new Signal<() => void>();
}
