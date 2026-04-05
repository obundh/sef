import { render, screen } from "@testing-library/react";
import { App } from "@/app/App";

describe("App", () => {
  it("renders the home simulator entry", () => {
    render(<App />);

    expect(screen.getByText("차폐실 시뮬레이터")).toBeInTheDocument();
  });
});
