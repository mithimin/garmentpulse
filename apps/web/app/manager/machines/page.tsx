'use client';

// apps/web/app/manager/machines/page.tsx
//
// The manager's MACHINES page. It shows the Machine map and nothing else. It is the SAME
// component as on the Dashboard (components/ManagerMachineMap.tsx), so both pages always
// look the same. The top bar and the menu come from app/manager/layout.tsx. Owned by Mithi.

import { ManagerMachineMap } from '../../../components/ManagerMachineMap';

export default function MachinesPage() {
  return <ManagerMachineMap />;
}
