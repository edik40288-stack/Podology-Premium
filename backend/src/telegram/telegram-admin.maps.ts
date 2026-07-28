import type { ItemSectionKey, TextFieldKey } from '../content/types';
import type { SectionAlias, TextAlias } from './telegram-admin.types';

export const sectionMap: Record<SectionAlias, ItemSectionKey> = {
  abt: 'about.items',
  cert: 'certificates.items',
  int: 'interior.items',
  pan: 'interior.panoramas',
  wrk: 'works.items',
  svc: 'services.items',
  spc: 'specialists.items',
  prof: 'profile.items',
};

export const sectionAliasByKey: Record<ItemSectionKey, SectionAlias> = {
  'about.items': 'abt',
  'certificates.items': 'cert',
  'interior.items': 'int',
  'interior.panoramas': 'pan',
  'works.items': 'wrk',
  'services.items': 'svc',
  'specialists.items': 'spc',
  'profile.items': 'prof',
};

export const textFieldMap: Record<TextAlias, TextFieldKey> = {
  hgreet: 'topHero.greetingTemplate',
  htitle: 'topHero.title',
  hsub: 'topHero.subtitle',
  hcolor: 'topHero.backgroundColor',
  hbg: 'topHero.backgroundImageUrl',
  xtitle: 'expertBlock.title',
  xsub: 'expertBlock.subtitle',
  xdesc: 'expertBlock.description',
  xaddr: 'expertBlock.address',
  xmap: 'expertBlock.mapUrl',
  xbtn: 'expertBlock.buttonText',
  xcolor: 'expertBlock.backgroundColor',
  xbg: 'expertBlock.backgroundImageUrl',
  atitle: 'about.title',
  adesc: 'about.description',
  ctitle: 'certificates.title',
  cdesc: 'certificates.description',
  ititle: 'interior.title',
  idesc: 'interior.description',
  wtitle: 'works.title',
  wdesc: 'works.description',
  stitle: 'services.title',
  sdesc: 'services.description',
  ptitle: 'specialists.title',
  pdesc: 'specialists.description',
  rtitle: 'profile.title',
  rdesc: 'profile.description',
};
