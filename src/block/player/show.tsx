/** @format */

import React from "react";

type Props = {
	className?: string;
};

/**
 * 空的 React 类组件，仅负责 UI 容器展示。
 * 播放/渲染逻辑已迁移到 `notationPlay.tsx`。
 */
export default class PlayerShow extends React.Component<Props> {
	render() {
		const { className, children } = this.props;
		return (
			<div className={className ?? "player-show"}>
				{children}
			</div>
		);
	}
}
