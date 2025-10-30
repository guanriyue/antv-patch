/* eslint-disable @typescript-eslint/no-explicit-any */
import type { BaseNodeStyleProps, Graph, HTMLStyleProps, ID } from "@antv/g6";
import { HTML } from "@antv/g6";
import React, { useMemo, useSyncExternalStore } from "react";
import { createPortal } from "react-dom";

type PortalRecord = Record<ID, React.ReactPortal>;

const graphToPortalsMap = new WeakMap<Graph, PortalRecord>();
const portalsChangeEventName = "g6-react-portal-changed";

const setPortal = (graph: Graph, id: ID, portal: React.ReactPortal) => {
  const portals = { ...graphToPortalsMap.get(graph) };
  graphToPortalsMap.set(graph, portals);
  portals[id] = portal;
  graph.emit(portalsChangeEventName);
};

const removePortal = (graph: Graph, id: ID) => {
  const portals = graphToPortalsMap.get(graph);
  if (portals && portals[id]) {
    const nextPortals = { ...portals };
    delete nextPortals[id];
    graphToPortalsMap.set(graph, nextPortals);
    graph.emit(portalsChangeEventName);
  }
};

export interface ReactNodeStyleProps extends BaseNodeStyleProps {
  /**
   * <zh/> React 组件
   *
   * <en/> React component
   */
  component: React.FC;
}

export class ReactNode extends HTML {
  protected setReactPortal(component: React.ReactNode): void {
    setPortal(
      this.context.graph,
      this.id,
      createPortal(component, this.getDomElement(), this.id)
    );
  }

  protected removeReactPortal(): void {
    removePortal(this.context.graph, this.id);
  }

  protected getKeyStyle(attributes: Required<HTMLStyleProps>) {
    return { ...super.getKeyStyle(attributes) };
  }

  constructor(options: any) {
    super(options as any);
  }

  public update(attr?: Partial<ReactNodeStyleProps> | undefined): void {
    super.update(attr);
  }

  public connectedCallback() {
    super.connectedCallback();
    const { component } = this.attributes as unknown as Record<
      string,
      React.ReactNode
    >;
    this.setReactPortal(component);
  }

  public attributeChangedCallback(name: any, oldValue: any, newValue: any) {
    super.attributeChangedCallback(name, oldValue, newValue);
    if (name === "component" && oldValue !== newValue) {
      const { component } = this.attributes as unknown as Record<
        string,
        React.ReactNode
      >;
      this.setReactPortal(component);
    }
  }

  public destroy(): void {
    this.removeReactPortal();
    super.destroy();
  }
}

const noop = () => {};
const empty: PortalRecord = {};

const createStore = (graph?: Graph | undefined | null) => {
  return {
    subscribe: (onStoreChange: () => void) => {
      if (!graph) {
        return noop;
      }

      graph.on(portalsChangeEventName, onStoreChange);

      return () => {
        graph.off(portalsChangeEventName, onStoreChange);
      };
    },

    getSnapshot: () => {
      if (!graph) {
        return empty;
      }

      const portals = graphToPortalsMap.get(graph);
      return portals || empty;
    },
  };
};

const useG6ReactPortals = (graph?: Graph | undefined | null) => {
  const store = useMemo(() => createStore(graph), [graph]);

  const portalRecord = useSyncExternalStore(
    store.subscribe,
    store.getSnapshot,
    store.getSnapshot
  );

  const portals = useMemo(() => {
    return Object.values(portalRecord);
  }, [portalRecord]);

  return portals;
};

interface G6ReactProviderProps {
  graph: Graph | undefined | null;
}

export const G6ReactNodeProvider = React.memo(
  ({ graph }: G6ReactProviderProps) => {
    const portals = useG6ReactPortals(graph);

    return <>{portals}</>;
  }
);

G6ReactNodeProvider.displayName = "G6ReactNodeProvider";
