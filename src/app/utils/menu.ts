// @ts-nocheck
import { StatusModel, TodoModel } from '@/common/interface';
import remote, { ipcRenderer } from './render'
import { getImg, openSetting, quit } from './send';
const { Menu } = remote;

type MenuFunctionType = (id: MenuCallbackType, todo?: TodoModel) => void;
export enum MenuCallbackType {
    Edit,
    Finish,
    PermanentDelete,
    Delete,
    Restore,
    Copy,
    UndoComplete,
    AddReminder,
    DeleteReminder,
    Exit,
}

// Get Todo item menu
export const getTodoItemMenu = (click: MenuFunctionType, todo: TodoModel) => {
    let status: StatusModel = todo.status;
    let todoItemMenu: Array<Electron.MenuItem> = [
        status != StatusModel.Completed && !todo.lastComplateDate ? {
            label: "Edit",
            click: () => click(MenuCallbackType.Edit, todo),
            icon: getImg('static/image/menu/edit.png')
        } : null,
        status != StatusModel.Completed && !todo.lastComplateDate ? {
            label: "Complete",
            click: () => click(MenuCallbackType.Finish, todo),
        } : {
            label: "Undo Complete",
            click: () => click(MenuCallbackType.UndoComplete, todo),
        },
        { type: 'separator' },
        status != StatusModel.Completed && !todo.lastComplateDate ? {
            label: todo.remind ? "Modify Reminder" : "Add Reminder",
            click: () => click(MenuCallbackType.AddReminder, todo),
            icon: getImg('static/image/menu/remind.png')
        } : null,
        todo.remind && status == StatusModel.Incomplete && !todo.lastComplateDate ?
            {
                label: "Delete Reminder",
                click: () => click(MenuCallbackType.DeleteReminder, todo),
            } : null,
        { type: 'separator' },
        {
            label: "Copy",
            click: () => click(MenuCallbackType.Copy, todo),
            icon: getImg('static/image/menu/copy.png')
        },
        {
            label: "Delete",
            click: () => click(MenuCallbackType.Delete, todo),
            icon: getImg('static/image/menu/del.png')
        },
    ];
    todoItemMenu = todoItemMenu.filter(m => m != null);
    let todoItemMenuIns = Menu.buildFromTemplate(todoItemMenu);
    todoItemMenuIns.popup()
}

// Get Todo item menu (with deletion)
export const getTodoItemMenuByDel = (click: MenuFunctionType, todo: TodoModel) => {
    let status: StatusModel = todo.status;
    let todoItemMenu: Array<Electron.MenuItem> = [
        status == StatusModel.Deleted && !todo.parentId ? {
            label: "Restore",
            click: () => click(MenuCallbackType.Restore, todo),
            // icon: getImg('static/image/menu/copy.png')
        } : null,
        status == StatusModel.Completed && !todo.parentId ? {
            label: "Undo Complete",
            click: () => click(MenuCallbackType.UndoComplete, todo),
        } : null,
        { type: 'separator' },
        status == StatusModel.Completed ? {
            label: "Delete",
            click: () => click(MenuCallbackType.Delete, todo),
        } : null,
        {
            label: "Copy",
            click: () => click(MenuCallbackType.Copy, todo),
            icon: getImg('static/image/menu/copy.png')
        },
        {
            label: "Permanently Delete",
            click: () => click(MenuCallbackType.PermanentDelete, todo),
            icon: getImg('static/image/menu/del.png')
        },
    ];
    todoItemMenu = todoItemMenu.filter(m => m != null);
    let todoItemMenuIns = Menu.buildFromTemplate(todoItemMenu);
    todoItemMenuIns.popup()
}

// Get top navigation menu
export const getTopNavMenu = (click: MenuFunctionType) => {
    let menus: Array<Electron.MenuItem> = [
        {
            label: "Settings",
            click: () => openSetting(),
            icon: getImg('static/image/menu/setting.png')
        },
        { type: 'separator' },
        /*{
            label: "Exit",
            click: () => quit(),
            icon: getImg('static/image/menu/quit.png')
        }*/];

    menus = menus.filter(m => m != null);
    let menusIns = Menu.buildFromTemplate(menus);
    menusIns.popup()
}
