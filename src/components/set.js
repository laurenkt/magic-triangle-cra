import React from "react";
import { connect } from "react-redux";
import Cell from "./cell";
import descriptors from "../descriptors.json";
import {
  addResultToParent,
  removeResult,
  updateResult,
  copyResult,
  getResultTree
} from "../reducers/results";
import PropTypes from "prop-types";

const mapStateToProps = (state, ownProps) => ({
  root: getResultTree(state.results, ownProps.root),
  context: descriptors
});

const clickDecorator = e => action => {
  e.preventDefault();

  action.click_coords = {
    x: e.clientX,
    y: e.clientY
  };

  return action;
};

const mapDispatchToProps = dispatch => ({
  onCopyClick: id => _ => {
    return dispatch(copyResult(id));
  },
  onLabelClick: parent => (e, label) => {
    return dispatch(clickDecorator(e)(addResultToParent(parent, label)));
  },
  onRemoveClick: (e, id) => {
    return dispatch(clickDecorator(e)(removeResult(id)));
  },
  onCellChange: id => state => {
    return dispatch(updateResult(id, state));
  }
});

let offsets = [];

const register_offset_for_parent = parent_id => dom => {
  if (!dom) return;

  const bounds = dom.getBoundingClientRect();
  offsets[parent_id] = {
    x: bounds.left,
    y: bounds.top
  };
};

const transform_origin = child => ({
  transformOrigin: offsets[child.parent]
    ? `${0 - Math.round(offsets[child.parent].x - child.origin.x)}px ${0 -
        Math.round(offsets[child.parent].y - child.origin.y)}px`
    : "0 0"
});

const Set = ({
  root,
  context,
  onLabelClick,
  onRemoveClick,
  onCellChange,
  onCopyClick,
  giveInstructions,
  ...props
}) => (
  <section {...props} className="mt-set">
    <Cell
      {...root}
      context={context}
      giveInstructions={giveInstructions && root.children.length === 0}
      onLabelClick={onLabelClick(root.id)}
      onRemoveClick={onRemoveClick}
      onCopyClick={onCopyClick(root.id)}
      onChange={onCellChange(root.id)}
    />
    <div ref={register_offset_for_parent(root.id)} className="mt-children">
      {root.children.map(child => (
        <Set
          key={child.id}
          root={child}
          context={context[child.title]}
          onLabelClick={onLabelClick}
          onCopyClick={onCopyClick}
          onRemoveClick={onRemoveClick}
          onCellChange={onCellChange}
          style={transform_origin(child)}
        />
      ))}
    </div>
  </section>
);

Set.propTypes = {
  root: PropTypes.object.isRequired,
  context: PropTypes.object.isRequired,
  onLabelClick: PropTypes.func.isRequired,
  onRemoveClick: PropTypes.func.isRequired,
  onCopyClick: PropTypes.func.isRequired,
  onCellChange: PropTypes.func.isRequired,
  giveInstructions: PropTypes.bool
};

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(Set);
