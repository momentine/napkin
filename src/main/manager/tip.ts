import { TodoModel } from "@/common/interface";

let list: Array<TodoModel> = [];

/**
 * Add a todo to the tip list
 * @param todo Todo information
 */
export const addTipTodo = (todo: TodoModel) => {
    var have = list.find(m => m.id == todo.id);
    if (!have) {
        list.push(todo);
    }
};

/**
 * Get todo information from the tip list
 * @param id Todo id
 * @returns TodoModel object or null if not found
 */
export const getTipTodo = (id: number): TodoModel => {
    var have = list.find(m => m.id == id);
    if (have) {
        return have;
    }
    return null;
};

/**
 * Get all todo ids in the tip list
 * @returns Array of todo ids
 */
export const getAllHaveTodoIds = (): number[] => {
    let ids: number[] = [];
    list.forEach(key => {
        ids.push(key.id);
    });
    return ids;
};

/**
 * Remove todo information from the tip list
 * @param id Todo id
 */
export const removeTipTodo = (id: number) => {
    var index = list.findIndex(m => m.id == id);
    if (index >= 0) {
        list.splice(index, 1);
    }
};

/**
 * Clear all todos from the tip list
 */
export const clearTipTodo = () => {
    list = [];
};
