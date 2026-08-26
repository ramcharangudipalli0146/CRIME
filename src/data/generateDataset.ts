import type {
  Person, Phone, BankAccount, Location, Vehicle, FIR, Organization,
  CDR, Transaction, LocationEvent, Entity, Relationship, EntityType,
  RelationshipType, Anomaly, Cluster, TimelineEvent, Dataset,
} from '@/types';

const FIRST_NAMES = ['Arjun', 'Vikram', 'Neha', 'Rohan', 'Priya', 'Karan', 'Aisha', 'Dev', 'Meera', 'Sanjay', 'Riya', 'Aditya', 'Kavya', 'Rahul', 'Ananya', 'Vivek', 'Pooja', 'Manish', 'Sneha', 'Rajesh', 'Divya', 'Amit', 'Shreya', 'Nikhil', 'Tara', 'Kabir', 'Isha', 'Arnav', 'Nisha', 'Dhruv', 'Ritu', 'Sahil', 'Anjali', 'Yash', 'Maya', 'Gaurav', 'Lena', 'Faisal', 'Zara', 'Imran', 'Rohan', 'Sara', 'Veer', 'Mira', 'Akash', 'Nadia', 'Suresh', 'Bhavna', 'Tarun', 'Ramesh', 'Geeta', 'Anil', 'Sunita', 'Kiran', 'Mahesh', 'Lata', 'Prakash'];
const LAST_NAMES = ['Mehta', 'Shah', 'Verma', 'Kapoor', 'Nair', 'Reddy', 'Singh', 'Iyer', 'Gupta', 'Joshi', 'Rao', 'Malhotra', 'Chopra', 'Bose', 'Das', 'Khan', 'Pillai', 'Banerjee', 'Mishra', 'Agarwal', 'Saxena', 'Bhat', 'Menon', 'Trivedi'];
const OCCUPATIONS = ['Trader', 'Contractor', 'Businessman', 'Accountant', 'Driver', 'Shopkeeper', 'Consultant', 'Teacher', 'Engineer', 'Agent', 'Supplier', 'Dealer', 'Freelancer', 'Manager', 'Retired', 'Unknown'];
const LOCATIONS_LIST = ['Sector 12 Market', 'Warehouse North', 'Transit Hub 3', 'Riverside Dock', 'Central Bus Stand', 'Industrial Estate', 'Old City Quarter', 'Highway Motel', 'Border Checkpost', 'Cargo Terminal', 'Downtown Plaza', 'Suburban Station', 'Port Gate 7', 'Cold Storage Unit', 'Private Garage', 'Railway Yard', 'Airport Cargo', 'Market Square', 'Container Depot', 'Fuel Station', 'Abandoned Mill', 'Crossing Junction', 'Loading Bay', 'Customs Office', 'Parking Complex'];
const BANKS = ['HDFC', 'SBI', 'ICICI', 'Axis', 'PNB', 'Canara', 'BoB', 'Kotak'];
const VEHICLE_TYPES = ['Sedan', 'SUV', 'Truck', 'Van', 'Motorcycle', 'Pickup'];
const CARRIERS = ['Airtel', 'Jio', 'Vi', 'BSNL'];

function seeded(seed: number) {
  let s = seed;
  return () => {
    s = (s * 9301 + 49297) % 233280;
    return s / 233280;
  };
}

const rng = seeded(20260826);
const pick = <T,>(arr: T[]): T => arr[Math.floor(rng() * arr.length)];
const pickN = <T,>(arr: T[], n: number): T[] => {
  const copy = [...arr];
  const out: T[] = [];
  for (let i = 0; i < n && copy.length; i++) out.push(copy.splice(Math.floor(rng() * copy.length), 1)[0]);
  return out;
};
const randInt = (min: number, max: number) => Math.floor(rng() * (max - min + 1)) + min;
const randFloat = (min: number, max: number) => rng() * (max - min) + min;

function pad(n: number, len: number) {
  return String(n).padStart(len, '0');
}

function ts(daysAgo: number, hour?: number): string {
  const d = new Date('2026-08-26T00:00:00');
  d.setDate(d.getDate() - daysAgo);
  d.setHours(hour ?? randInt(0, 23), randInt(0, 59), randInt(0, 59));
  return d.toISOString();
}

export function generateDataset(): Dataset {
  const persons: Person[] = [];
  const phones: Phone[] = [];
  const banks: BankAccount[] = [];
  const locations: Location[] = [];
  const vehicles: Vehicle[] = [];
  const firs: FIR[] = [];
  const organizations: Organization[] = [];
  const cdrs: CDR[] = [];
  const transactions: Transaction[] = [];
  const locationEvents: LocationEvent[] = [];

  // 60 persons in 6 clusters of 10
  for (let i = 1; i <= 60; i++) {
    persons.push({
      id: `P${pad(i, 3)}`,
      name: `${pick(FIRST_NAMES)} ${pick(LAST_NAMES)}`,
      age: randInt(24, 62),
      gender: rng() > 0.5 ? 'male' : 'female',
      occupation: pick(OCCUPATIONS),
      address: `Addr-${pad(i, 3)}`,
    });
  }

  // 30 phones
  for (let i = 1; i <= 30; i++) {
    phones.push({
      id: `PHONE-${pad(i, 3)}`,
      owner: `P${pad(randInt(1, 60), 3)}`,
      carrier: pick(CARRIERS),
    });
  }

  // 20 bank accounts
  for (let i = 1; i <= 20; i++) {
    banks.push({
      id: `BANK-${pad(i, 3)}`,
      owner: `P${pad(randInt(1, 60), 3)}`,
      bank: pick(BANKS),
      balance: randInt(5000, 500000),
    });
  }

  // 25 locations
  for (let i = 0; i < 25; i++) {
    locations.push({
      id: `LOC-${pad(i + 1, 2)}`,
      name: LOCATIONS_LIST[i],
      type: pick(['commercial', 'residential', 'industrial', 'transit', 'remote']),
    });
  }

  // 15 vehicles
  for (let i = 1; i <= 15; i++) {
    vehicles.push({
      id: `VEH-${pad(i, 3)}`,
      type: pick(VEHICLE_TYPES),
      owner: `P${pad(randInt(1, 60), 3)}`,
      registration: `DL-${randInt(1, 99)}-${String.fromCharCode(65 + randInt(0, 25))}${String.fromCharCode(65 + randInt(0, 25))}-${randInt(1000, 9999)}`,
    });
  }

  // 30 FIRs
  const firTitles = ['Financial Fraud Suspected', 'Unauthorized Movement of Goods', 'Suspicious Assembly', 'Cyber Transaction Irregularity', 'Cross-Border Movement Flag', 'Smuggling Intelligence Report', 'Hawala Channel Suspected', 'Fake Identity Investigation', 'Vehicle Misuse Report', 'Communication Pattern Alert'];
  for (let i = 1; i <= 30; i++) {
    const involved = pickN(persons.map(p => p.id), randInt(2, 5));
    firs.push({
      id: `FIR-2026-${pad(i, 3)}`,
      title: pick(firTitles),
      date: ts(randInt(1, 180)),
      section: `Sec ${randInt(120, 420)}`,
      status: pick(['open', 'under_investigation', 'closed']),
      entities: involved,
    });
  }

  // 5 organizations
  const orgNames = ['Blue Ocean Trading Co', 'Northwind Logistics', 'Summit Holdings', 'Crystal Imports', 'Apex Enterprises'];
  for (let i = 0; i < 5; i++) {
    organizations.push({
      id: `ORG-${pad(i + 1, 2)}`,
      name: orgNames[i],
      type: pick(['trading', 'logistics', 'holding', 'import-export', 'services']),
    });
  }

  // Define clusters: 6 groups of 10 persons
  const clusters: { personIds: string[]; name: string; description: string; dominantType: EntityType }[] = [
    { personIds: persons.slice(0, 10).map(p => p.id), name: 'Cluster Alpha', description: 'High-frequency communication group', dominantType: 'person' },
    { personIds: persons.slice(10, 20).map(p => p.id), name: 'Cluster Beta', description: 'Shared location pattern group', dominantType: 'person' },
    { personIds: persons.slice(20, 30).map(p => p.id), name: 'Cluster Gamma', description: 'Financial transaction network', dominantType: 'person' },
    { personIds: persons.slice(30, 40).map(p => p.id), name: 'Cluster Delta', description: 'Cross-cluster bridge group', dominantType: 'person' },
    { personIds: persons.slice(40, 50).map(p => p.id), name: 'Cluster Epsilon', description: 'Vehicle sharing network', dominantType: 'person' },
    { personIds: persons.slice(50, 60).map(p => p.id), name: 'Cluster Zeta', description: 'Case association group', dominantType: 'person' },
  ];

  // Assign cluster IDs to persons
  clusters.forEach((c, ci) => {
    c.personIds.forEach(pid => {
      const p = persons.find(pp => pp.id === pid);
      if (p) (p as any).clusterId = ci;
    });
  });

  // Generate CDRs - heavy within clusters, sparse across
  for (let i = 0; i < 550; i++) {
    let caller: string, receiver: string;
    if (rng() < 0.7) {
      // within cluster
      const c = clusters[Math.floor(rng() * clusters.length)];
      caller = pick(c.personIds);
      receiver = pick(c.personIds);
      while (receiver === caller) receiver = pick(c.personIds);
    } else {
      caller = `P${pad(randInt(1, 60), 3)}`;
      receiver = `P${pad(randInt(1, 60), 3)}`;
      while (receiver === caller) receiver = `P${pad(randInt(1, 60), 3)}`;
    }
    cdrs.push({
      id: `CDR-${pad(i + 1, 4)}`,
      caller, receiver,
      timestamp: ts(randInt(0, 90)),
      duration: randInt(10, 900),
      location: pick(locations).id,
      callType: pick(['incoming', 'outgoing', 'missed']) as CDR['callType'],
    });
  }

  // Plant communication anomaly: P001 makes 47 calls in 24h to P002
  const anomalyDay = randInt(1, 30);
  for (let i = 0; i < 47; i++) {
    cdrs.push({
      id: `CDR-ANOM-${pad(i, 3)}`,
      caller: 'P001',
      receiver: pick(['P002', 'P003', 'P004', 'P005']),
      timestamp: ts(anomalyDay, randInt(0, 23)),
      duration: randInt(30, 300),
      location: 'LOC-01',
      callType: 'outgoing',
    });
  }

  // Generate transactions - 300+
  for (let i = 0; i < 320; i++) {
    let sender: string, receiver: string;
    if (rng() < 0.65) {
      const c = clusters[Math.floor(rng() * clusters.length)];
      sender = pick(c.personIds);
      receiver = pick(c.personIds);
      while (receiver === sender) receiver = pick(c.personIds);
    } else {
      sender = `P${pad(randInt(1, 60), 3)}`;
      receiver = `P${pad(randInt(1, 60), 3)}`;
      while (receiver === sender) receiver = `P${pad(randInt(1, 60), 3)}`;
    }
    transactions.push({
      id: `TXN-${pad(i + 1, 4)}`,
      sender, receiver,
      amount: randInt(1000, 50000),
      timestamp: ts(randInt(0, 90)),
      location: pick(locations).id,
      transactionType: pick(['transfer', 'cash', 'upi', 'cheque']) as Transaction['transactionType'],
    });
  }

  // Plant transaction anomaly: P011 sends 850000
  transactions.push({
    id: 'TXN-ANOM-001',
    sender: 'P011',
    receiver: 'P012',
    amount: 850000,
    timestamp: ts(randInt(0, 30)),
    location: 'LOC-02',
    transactionType: 'transfer',
  });
  transactions.push({
    id: 'TXN-ANOM-002',
    sender: 'P011',
    receiver: 'P013',
    amount: 1200000,
    timestamp: ts(randInt(0, 30)),
    location: 'LOC-02',
    transactionType: 'transfer',
  });

  // Location events - 200+
  for (let i = 0; i < 220; i++) {
    let entity: string;
    if (rng() < 0.6) {
      const c = clusters[Math.floor(rng() * clusters.length)];
      entity = pick(c.personIds);
    } else {
      entity = `P${pad(randInt(1, 60), 3)}`;
    }
    locationEvents.push({
      id: `LOC-EVT-${pad(i + 1, 4)}`,
      entity,
      location: pick(locations).id,
      timestamp: ts(randInt(0, 90)),
      eventType: pick(['visit', 'meeting', 'sighting']) as LocationEvent['eventType'],
    });
  }

  // Plant location anomaly: P021, P022, P023 all at LOC-05 within 2 hours
  const locAnomalyTime = ts(randInt(0, 20), 14);
  ['P021', 'P022', 'P023', 'P024'].forEach((pid, idx) => {
    locationEvents.push({
      id: `LOC-ANOM-${pad(idx, 2)}`,
      entity: pid,
      location: 'LOC-05',
      timestamp: ts(randInt(0, 20), 14 + idx),
      eventType: 'meeting',
    });
  });

  // Build entities array
  const entities: Entity[] = [];
  persons.forEach(p => entities.push({ id: p.id, type: 'person', label: p.name, name: p.name, attributes: { age: p.age, gender: p.gender, occupation: p.occupation, address: p.address } }));
  phones.forEach(p => entities.push({ id: p.id, type: 'phone', label: p.id, attributes: { owner: p.owner, carrier: p.carrier } }));
  banks.forEach(b => entities.push({ id: b.id, type: 'bank', label: b.id, attributes: { owner: b.owner, bank: b.bank, balance: b.balance } }));
  locations.forEach(l => entities.push({ id: l.id, type: 'location', label: l.name, name: l.name, attributes: { type: l.type } }));
  vehicles.forEach(v => entities.push({ id: v.id, type: 'vehicle', label: v.id, attributes: { type: v.type, owner: v.owner, registration: v.registration } }));
  firs.forEach(f => entities.push({ id: f.id, type: 'fir', label: f.id, attributes: { title: f.title, date: f.date, section: f.section, status: f.status } }));
  organizations.forEach(o => entities.push({ id: o.id, type: 'organization', label: o.name, name: o.name, attributes: { type: o.type } }));

  // Assign cluster IDs to entities
  clusters.forEach((c, ci) => {
    c.personIds.forEach(pid => {
      const e = entities.find(en => en.id === pid);
      if (e) e.clusterId = ci;
    });
  });

  // Build relationships from CDRs, transactions, location events, FIRs, vehicles
  const relationships: Relationship[] = [];
  const relMap = new Map<string, Relationship>();

  const addRel = (source: string, target: string, type: RelationshipType, strength: 'low' | 'medium' | 'high', timestamp?: string, attrs?: Record<string, string | number>) => {
    const key = `${source}-${target}-${type}`;
    const existing = relMap.get(key);
    if (existing) {
      existing.weight += 1;
      const order = { low: 1, medium: 2, high: 3 };
      if (order[strength] > order[existing.strength]) existing.strength = strength;
      if (attrs) Object.assign(existing.attributes, attrs);
    } else {
      const r: Relationship = {
        id: `REL-${pad(relationships.length + 1, 4)}`,
        source, target, type, strength,
        weight: 1,
        timestamp,
        attributes: attrs ?? {},
      };
      relMap.set(key, r);
      relationships.push(r);
    }
  };

  cdrs.forEach(c => {
    addRel(c.caller, c.receiver, 'called', c.duration > 300 ? 'high' : c.duration > 120 ? 'medium' : 'low', c.timestamp, { duration: c.duration, location: c.location });
  });

  transactions.forEach(t => {
    addRel(t.sender, t.receiver, 'transacted', t.amount > 30000 ? 'high' : t.amount > 10000 ? 'medium' : 'low', t.timestamp, { amount: t.amount, type: t.transactionType, location: t.location });
  });

  // Location events -> located_at relationships
  const locByEntity = new Map<string, Set<string>>();
  locationEvents.forEach(le => {
    addRel(le.entity, le.location, 'located_at', 'medium', le.timestamp, { eventType: le.eventType });
    if (!locByEntity.has(le.entity)) locByEntity.set(le.entity, new Set());
    locByEntity.get(le.entity)!.add(le.location);
  });

  // Shared locations: if two entities at same location within short window
  const locByTimeLoc = new Map<string, string[]>();
  locationEvents.forEach(le => {
    const key = `${le.location}-${le.timestamp.slice(0, 13)}`;
    if (!locByTimeLoc.has(key)) locByTimeLoc.set(key, []);
    locByTimeLoc.get(key)!.push(le.entity);
  });
  locByTimeLoc.forEach(entities2 => {
    if (entities2.length > 1) {
      for (let i = 0; i < entities2.length; i++) {
        for (let j = i + 1; j < entities2.length; j++) {
          if (entities2[i] !== entities2[j]) addRel(entities2[i], entities2[j], 'connected_to', 'low');
        }
      }
    }
  });

  // FIR associations
  firs.forEach(f => {
    f.entities.forEach(eid => {
      addRel(eid, f.id, 'mentioned_in', 'high', f.date, { title: f.title, section: f.section });
    });
    // connect entities in same FIR
    for (let i = 0; i < f.entities.length; i++) {
      for (let j = i + 1; j < f.entities.length; j++) {
        addRel(f.entities[i], f.entities[j], 'associated', 'medium');
      }
    }
  });

  // Vehicle sharing
  vehicles.forEach(v => {
    addRel(v.owner, v.id, 'shared_vehicle', 'medium', undefined, { type: v.type, registration: v.registration });
  });
  // Some vehicles shared between cluster members
  for (let i = 0; i < 8; i++) {
    const c = clusters[Math.floor(rng() * clusters.length)];
    const v = vehicles[randInt(0, vehicles.length - 1)];
    const p = pick(c.personIds);
    if (p !== v.owner) addRel(p, v.id, 'shared_vehicle', 'medium');
  }

  // Phone ownership
  phones.forEach(p => {
    addRel(p.owner, p.id, 'connected_to', 'high', undefined, { carrier: p.carrier });
  });

  // Bank ownership
  banks.forEach(b => {
    addRel(b.owner, b.id, 'connected_to', 'high', undefined, { bank: b.bank, balance: b.balance });
  });

  // Organization associations
  organizations.forEach(o => {
    const members = pickN(persons.map(p => p.id), randInt(2, 4));
    members.forEach(m => addRel(m, o.id, 'associated', 'medium'));
  });

  // Cross-cluster bridges
  for (let i = 0; i < clusters.length; i++) {
    const next = (i + 1) % clusters.length;
    const a = pick(clusters[i].personIds);
    const b = pick(clusters[next].personIds);
    addRel(a, b, 'connected_to', 'high');
    // Add a few calls/transactions across
    for (let k = 0; k < 3; k++) {
      cdrs.push({ id: `CDR-BRIDGE-${i}-${k}`, caller: a, receiver: b, timestamp: ts(randInt(0, 60)), duration: randInt(60, 400), location: 'LOC-01', callType: 'outgoing' });
      addRel(a, b, 'called', 'high', ts(randInt(0, 60)), { duration: randInt(60, 400) });
    }
  }

  // Compute attention scores
  const degreeMap = new Map<string, number>();
  relationships.forEach(r => {
    degreeMap.set(r.source, (degreeMap.get(r.source) ?? 0) + 1);
    degreeMap.set(r.target, (degreeMap.get(r.target) ?? 0) + 1);
  });
  entities.forEach(e => {
    let score = 0;
    const deg = degreeMap.get(e.id) ?? 0;
    score += Math.min(deg * 2, 40);
    // anomaly bonus
    // (will be applied after anomalies computed)
    e.attentionScore = Math.min(score, 60);
  });

  // Build clusters output
  const clusterOut: Cluster[] = clusters.map((c, i) => ({
    id: i,
    name: c.name,
    entities: c.personIds,
    description: c.description,
    dominantType: c.dominantType,
  }));

  // Detect anomalies
  const anomalies: Anomaly[] = [];

  // Communication anomaly: P001 burst
  anomalies.push({
    id: 'ANOM-001',
    type: 'communication',
    severity: 'high',
    entity: 'P001',
    title: 'Unusual Communication Frequency',
    description: 'Entity P001 made 47 outgoing calls within a 24-hour period, significantly exceeding the normal range of 2-3 calls per week observed for this entity.',
    timestamp: ts(anomalyDay, 12),
    relatedEntities: ['P002', 'P003', 'P004', 'P005'],
    value: 47,
    expectedRange: '2-3 calls/week',
  });

  // Transaction anomaly: P011 large transfers
  anomalies.push({
    id: 'ANOM-002',
    type: 'transaction',
    severity: 'high',
    entity: 'P011',
    title: 'Unusual Transaction Amount',
    description: 'Entity P011 initiated transactions of ₹850,000 and ₹1,200,000, significantly exceeding the normal transaction range of ₹1,000-₹50,000 for this entity.',
    timestamp: ts(randInt(0, 30), 15),
    relatedEntities: ['P012', 'P013'],
    value: 1200000,
    expectedRange: '₹1,000 - ₹50,000',
  });

  // Location anomaly: shared location
  anomalies.push({
    id: 'ANOM-003',
    type: 'location',
    severity: 'medium',
    entity: 'P021',
    title: 'Potential Shared-Location Pattern',
    description: 'Entities P021, P022, P023, and P024 all appeared at Warehouse North (LOC-05) within a 4-hour window. This co-location pattern may warrant further review.',
    timestamp: ts(randInt(0, 20), 14),
    relatedEntities: ['P022', 'P023', 'P024'],
    expectedRange: 'No prior co-location history',
  });

  // Network anomaly: high-degree bridge entity
  anomalies.push({
    id: 'ANOM-004',
    type: 'network',
    severity: 'medium',
    entity: 'P031',
    title: 'Cross-Cluster Bridge Entity',
    description: 'Entity P031 maintains high-connectivity relationships across multiple clusters, acting as a potential bridge between otherwise disconnected groups.',
    timestamp: ts(0, 10),
    relatedEntities: ['P030', 'P032', 'P040'],
  });

  // Apply anomaly bonus to attention scores
  anomalies.forEach(a => {
    const e = entities.find(en => en.id === a.entity);
    if (e) e.attentionScore = Math.min((e.attentionScore ?? 0) + (a.severity === 'high' ? 25 : 15), 100);
  });

  // Boost bridge entities
  for (let i = 0; i < clusters.length; i++) {
    const next = (i + 1) % clusters.length;
    const a = pick(clusters[i].personIds);
    const e = entities.find(en => en.id === a);
    if (e) e.attentionScore = Math.min((e.attentionScore ?? 0) + 10, 100);
  }

  // Build timeline
  const timeline: TimelineEvent[] = [];
  cdrs.slice(0, 100).forEach(c => {
    timeline.push({
      id: `TL-${c.id}`,
      timestamp: c.timestamp,
      type: 'call',
      entity: c.caller,
      description: `${c.caller} called ${c.receiver} (${c.duration}s)`,
      relatedEntities: [c.receiver],
      location: c.location,
    });
  });
  transactions.slice(0, 80).forEach(t => {
    timeline.push({
      id: `TL-${t.id}`,
      timestamp: t.timestamp,
      type: 'transaction',
      entity: t.sender,
      description: `${t.sender} transacted ₹${t.amount.toLocaleString('en-IN')} with ${t.receiver}`,
      relatedEntities: [t.receiver],
      location: t.location,
    });
  });
  locationEvents.slice(0, 60).forEach(le => {
    timeline.push({
      id: `TL-${le.id}`,
      timestamp: le.timestamp,
      type: 'location',
      entity: le.entity,
      description: `${le.entity} appeared at ${le.location} (${le.eventType})`,
      relatedEntities: [],
      location: le.location,
    });
  });
  firs.forEach(f => {
    timeline.push({
      id: `TL-${f.id}`,
      timestamp: f.date,
      type: 'case',
      entity: f.entities[0] ?? '',
      description: `FIR ${f.id} filed: ${f.title}`,
      relatedEntities: f.entities.slice(1),
    });
  });
  timeline.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());

  return {
    persons, phones, banks, locations, vehicles, firs, organizations,
    cdrs, transactions, locationEvents,
    entities, relationships,
    clusters: clusterOut,
    anomalies,
    timeline,
    metadata: {
      createdAt: new Date().toISOString(),
      lastAnalyzed: null,
      source: 'demo',
    },
  };
}
