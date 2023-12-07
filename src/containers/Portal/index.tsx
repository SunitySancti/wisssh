import { useEffect } from 'react';
import { createPortal } from 'react-dom';

import type { ReactNode } from 'react'


interface PortalProps {
    children: ReactNode | ReactNode[];
    layer: 'app' | 'dropdown' | 'tooltip' | 'modal'
}


export const Portal = ({
    children,
    layer
} : PortalProps
) => {
  const mount = document.getElementById(`${ layer }-root`);
  const el = document.createElement('div');
  el.classList.add(`${ layer }-container`)

  useEffect(() => {
    if(mount) {
        mount.appendChild(el);
        return () => {
            mount.removeChild(el)
        }
    }
  }, [el, mount]);

  return createPortal(children, el)
}
