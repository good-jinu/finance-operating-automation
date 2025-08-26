Define the graph¶
Let's define a graph with a simple loop. Note that we use a conditional edge to implement a termination condition.

```typescript
import { StateGraph, Annotation } from "@langchain/langgraph";

// Define the state with a reducer
const StateAnnotation = Annotation.Root({
aggregate: Annotation<string[]>({
reducer: (a, b) => a.concat(b),
default: () => [],
}),
});

// Define nodes
const a = async function (state: typeof StateAnnotation.State) {
console.log(`Node A sees ${state.aggregate}`);
return { aggregate: ["A"] };
}

const b = async function (state: typeof StateAnnotation.State) {
console.log(`Node B sees ${state.aggregate}`);
return { aggregate: ["B"] };
}

// Define edges
const route = async function (state: typeof StateAnnotation.State) {
if (state.aggregate.length < 7) {
return "b";
} else {
return "__end__";
}
}


// Define the graph
const graph = new StateGraph(StateAnnotation)
.addNode("a", a)
.addNode("b", b)
.addEdge("__start__", "a")
.addConditionalEdges("a", route)
.addEdge("b", "a")
.compile();
```

This architecture is similar to a ReAct agent in which node "a" is a tool-calling model, and node "b" represents the tools.

In our route conditional edge, we specify that we should end after the "aggregate" list in the state passes a threshold length.

Invoking the graph, we see that we alternate between nodes "a" and "b" before terminating once we reach the termination condition.