
import { remote } from 'electron';
import clazz from 'classname';
import React, { Component } from 'react';
import helper from 'utils/helper';
import ConversationType from '../../../wfc/model/conversationType';
import classes from './style.css';
import ConversationInfo from '../../../wfc/model/conversationInfo';
import wfc from '../../../wfc/wfc'


export default class ConversationItem extends Component {
    active = false;

    // 1. 原来是空的
    // 2. 绑定新的数据(新会话，会话更新了, 会话的target更新了)
    // 3. 选中、取消选中
    shouldComponentUpdate(nextProps) {
        if (!this.props.conversationInfo || this.active === undefined) {
            return true;
        }

        if (!ConversationInfo.equals(this.props.conversationInfo, nextProps.conversationInfo)) {
            return true;
        }

        if (nextProps.currentConversation && this.active !== (nextProps.currentConversation.equal(nextProps.conversationInfo.conversation))) {
            return true;
        }

        return false;
    }

    showContextMenu(conversationInfo) {
        var menu = new remote.Menu.buildFromTemplate([
            {
                label: 'Send Message',
                click: () => {
                    this.props.chatTo(conversationInfo.conversation);
                }
            },
            {
                type: 'separator'
            },
            {
                label: conversationInfo.isTop ? 'Unsticky' : 'Sticky on Top',
                click: () => {
                    this.props.sticky(conversationInfo);
                }
            },
            {
                label: 'Delete',
                click: () => {
                    this.props.removeChat(conversationInfo);
                }
            },
            {
                label: 'Mark as Read',
                click: () => {
                    this.props.markedRead(conversationInfo.UserName);
                }
            },
        ]);

        menu.popup(remote.getCurrentWindow());
    }

    render() {
        let e = this.props.conversationInfo;
        let conversation = this.props.currentConversation;
        this.active = conversation && conversation.equal(e.conversation);
        let chatTo = this.props.chatTo;
        var muted = e.isSilent;
        var isTop = e.isTop;
        let unreadCount = e.unreadCount;
        let hasUnread = unreadCount.unread > 0 || unreadCount.unreadMention > 0 || unreadCount.unreadMentionAll > 0;
        var portrait = e.portrait();
        let txtUnread = unreadCount.unread > 99 ? "..." : unreadCount.unread;

        if (!portrait) {
            switch (e.conversation.conversationType) {
                case ConversationType.Single:
                    portrait = 'assets/images/user-fallback.png';
                    break;
                case ConversationType.Group:
                    portrait = 'assets/images/default_group_avatar.png';
                    break;
                default:
                    break;
            }
        }

        return (
            <div
                className={clazz(classes.chat, {
                    [classes.sticky]: isTop,
                    [classes.active]: this.active,
                })}
                // TODO key should be conversation
                onContextMenu={ev => this.showContextMenu(e)}
                onClick={ev => {
                    chatTo(e.conversation)
                    // wfc.clearConversationUnreadStatus(e.conversation);
                }}>
                <div className={classes.inner}>
                    <div data-aftercontent={txtUnread} className={clazz(classes.dot, {
                        [classes.green]: muted && hasUnread,
                        [classes.red]: !muted && hasUnread
                    })}>
                        <img
                            className="disabledDrag"
                            // TODO portrait
                            src={portrait}
                            onError={e => (e.target.src = 'assets/images/user-fallback.png')}
                        />
                    </div>

                    <div className={classes.info}>
                        <p
                            className={classes.username}
                            dangerouslySetInnerHTML={{ __html: e.title() }} />

                        <span
                            className={classes.message}
                            dangerouslySetInnerHTML={{ __html: e.lastMessage ? e.lastMessage.messageContent.digest() : '' }} />
                    </div>
                </div>

                <span className={classes.times}>
                    {
                        e.timestamp ? helper.timeFormat(e.timestamp) : ''
                    }
                </span>
            </div>
        );

    }

}
