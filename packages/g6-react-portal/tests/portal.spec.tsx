import { describe, expect, it } from "vitest";
import { Graph, register, type NodeData } from "@antv/g6";
import { render, screen } from "@testing-library/react";
import { G6ReactNodeProvider, ReactNode } from "../src";
import { Renderer as SVGRenderer } from "@antv/g-svg";
import "@testing-library/jest-dom";
import React, { act } from "react";

const reactNodeName = "react-node";

register("node", reactNodeName, ReactNode);

describe("G6 React Portal", () => {
  const TestContext = React.createContext<{ count: number } | null>(null);

  const TestContextProvider = (props: React.PropsWithChildren) => {
    const [count, setCount] = React.useState(0);

    const contextValue = React.useMemo(() => ({ count }), [count]);

    return (
      <TestContext.Provider value={contextValue}>
        {props.children}
        <button
          data-testid="increase"
          onClick={() => setCount((prev) => prev + 1)}
        >
          Increase
        </button>
      </TestContext.Provider>
    );
  };

  const GraphNode = (props: { data: NodeData }) => {
    const context = React.useContext(TestContext);

    const nodeData = props.data;
    const customData = nodeData.data as {
      name: string;
    };
    return (
      <div data-testid={nodeData.id}>
        <span data-testid={`${nodeData.id}-name`}>{customData.name}</span>
        <span data-testid={`${nodeData.id}-count`}>
          {context ? context.count : "no-context"}
        </span>
      </div>
    );
  };

  const buildGraph = () => {
    return new Graph({
      renderer: () => new SVGRenderer(),
      node: {
        type: reactNodeName,
        style: {
          component: (data: NodeData) => <GraphNode data={data} />,
        },
      },
      data: {
        nodes: [
          {
            id: "node1",
            data: {
              name: "Node 1",
            },
          },
          {
            id: "node2",
            data: {
              name: "Node 2",
            },
          },
          {
            id: "node3",
            data: {
              name: "Node 3",
            },
          },
        ],
      },
    });
  };

  it("Should render ReactNode correctly", async () => {
    const graph = buildGraph();

    render(
      <div>
        <div data-testid="graphBox" />
        <G6ReactNodeProvider graph={graph} />
      </div>
    );

    const graphBox = screen.getByTestId("graphBox");
    expect(graphBox).toBeDefined();

    graph.setOptions({
      container: graphBox,
    });
    await act(async () => graph.render());

    expect(screen.getByTestId("node1-name")).toHaveTextContent("Node 1");
    expect(screen.getByTestId("node2-name")).toHaveTextContent("Node 2");
    expect(screen.getByTestId("node3-name")).toHaveTextContent("Node 3");
  });

  it("Should update ReactNode when data changes", async () => {
    const graph = buildGraph();

    render(
      <div>
        <div data-testid="graphBox" />
        <G6ReactNodeProvider graph={graph} />
      </div>
    );

    const graphBox = screen.getByTestId("graphBox");
    expect(graphBox).toBeDefined();

    graph.setOptions({
      container: graphBox,
    });
    await act(async () => graph.render());
    expect(screen.getByTestId("node1-name")).toHaveTextContent("Node 1");

    // Update node data
    graph.updateNodeData([
      {
        id: "node1",
        data: {
          name: "Updated Node 1",
        },
      },
    ]);
    await act(() => graph.render());
    expect(screen.getByTestId("node1-name")).toHaveTextContent(
      "Updated Node 1"
    );
  });

  it("Support Context API in ReactNode", async () => {
    const graph = buildGraph();
    render(
      <TestContextProvider>
        <div>
          <div>
            <div data-testid="graphBox" />
            <G6ReactNodeProvider graph={graph} />
          </div>
        </div>
      </TestContextProvider>
    );

    const graphBox = screen.getByTestId("graphBox");
    expect(graphBox).toBeDefined();

    graph.setOptions({
      container: graphBox,
    });
    await act(async () => graph.render());
    expect(screen.getByTestId("node1-count")).toHaveTextContent("0");
    expect(screen.getByTestId("node2-count")).toHaveTextContent("0");
    expect(screen.getByTestId("node3-count")).toHaveTextContent("0");

    const increaseButton = screen.getByTestId("increase");
    await act(async () => {
      increaseButton.click();
    });
    expect(screen.getByTestId("node1-count")).toHaveTextContent("1");
    expect(screen.getByTestId("node2-count")).toHaveTextContent("1");
    expect(screen.getByTestId("node3-count")).toHaveTextContent("1");
  });
});
