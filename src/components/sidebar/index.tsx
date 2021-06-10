import { FC } from 'react';

import SidebarSection from './Sidebar';

interface Props {
  id: string;
}

const Sidebar: FC<Props> = ({ id }) => {
  return (
    <SidebarSection id={id}>
      <span>Hello from Sidebar</span>
    </SidebarSection>
  );
};

export default Sidebar;
