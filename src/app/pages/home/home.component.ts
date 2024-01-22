import { ChangeDetectorRef, Component, Injector, OnInit, computed, effect, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { Observable, of, tap, map, take } from 'rxjs';
import { FormControl, ReactiveFormsModule, Validators } from '@angular/forms';
import { Task } from '../../models/task.model';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [CommonModule, RouterModule, ReactiveFormsModule],
  templateUrl: './home.component.html',
  styleUrl: './home.component.scss',
})
export class HomeComponent implements OnInit {
  tasks = signal<Task[]>([
    {
      id: 1,
      title: 'Workout',
      isCompleted: false,
      editing: false,
    },
    {
      id: 2,
      title: 'Studing',
      isCompleted: true,
      editing: false,
    },
  ]);

  taskObservable$!: Observable<Task[]>;

  taskInput: FormControl<string> = new FormControl('', {
    nonNullable: true,
    validators: [Validators.required],
  });

  filter = signal('all');
  taskByFilter = computed(() => {
    const filter = this.filter();
    const tasks = this.tasks();
    if(filter === 'all') {
      return tasks;
    } else if (filter === 'completed') {
      return tasks.filter(task => task.isCompleted);
    } else {
      return tasks.filter(task => !task.isCompleted);
    }
  });

  pendingTasks = computed(() => {
    const tasks = this.tasks();
    return tasks.filter(task => !task.isCompleted).length;
   });

  constructor(private cd: ChangeDetectorRef) {}

  injector = inject(Injector);

  ngOnInit() {
    // this.initializeTaskObservable();

    const storage = localStorage.getItem('tasks');
    if (storage) {
      const tasks = JSON.parse(storage);
      this.tasks.set(tasks);
    }
    this.trackTasks();
  }

  trackTasks() {
    effect(() => {
      const tasks = this.tasks();
      localStorage.setItem('tasks', JSON.stringify(tasks));
    }, { injector: this.injector });
  }

  private initializeTaskObservableRXJS() {
    const storedTasks = localStorage.getItem('tasks');
    const initialTasks = storedTasks ? JSON.parse(storedTasks) : null;
    this.taskObservable$ = of(initialTasks);
  }

  changeHandler() {
    if (this.taskInput.valid) {
      const newTask = this.taskInput.value.trim();
      this.addTodo(newTask);
      this.taskInput.setValue('');
    }
  }

  // addTodoRxjs(title: string) {
  //   const newTask: Task = {
  //     id: Date.now(),
  //     title,
  //     isCompleted: false,
  //   };
  //   if (title.length) {
  //     this.taskObservable$ = this.taskObservable$.pipe(
  //       take(1),
  //       map((taskList: Task[]) => [...taskList, newTask]),
  //       tap((updatedList: Task[]) => {
  //         this.updateLocalStorage(updatedList);
  //         this.initializeTaskObservable();
  //         this.cd.detectChanges();
  //       })
  //     );
  //   } else {
  //     alert('You have to add some text to the input');
  //   }
  // }

  addTodo(title: string) {
    const newTask: Task = {
      id: Date.now(),
      title,
      isCompleted: false,
    };

    this.tasks.update((tasks) => [...tasks, newTask]);
  }

  // getPendingTaskRXJS() {
  //   return this.tasks.(
  //     map((tasks) => tasks.filter((task) => task.isCompleted === false)),
  //     map((completedTasks) => completedTasks.length)
  //   );
  // }


  // deleteTodoRXJS(index: number) {
  //   this.taskObservable$ = this.taskObservable$.pipe(
  //     tap((taskList) => {
  //       const updatedList = taskList.filter((task, i) => i !== index);
  //       console.log(updatedList, 'deleted');
  //       this.updateLocalStorage(updatedList);
  //       this.initializeTaskObservable();
  //       this.cd.detectChanges();
  //     })
  //   );

  //   // Signals
  //   this.tasks.update((tasks) => {
  //     tasks.splice(index, 1);
  //     return tasks;
  //   });
  // }

    deleteTodo(index: number) {
    this.tasks.update((tasks) => tasks.filter((task, position) => position !== index));
  }

  updateTodo(index: number, newTask: Task) {
    this.taskObservable$ = this.taskObservable$.pipe(
      tap((taskList) => {
        const updatedList: Task[] = [...taskList];
        updatedList[index] = newTask;
        console.log(updatedList);
        this.updateLocalStorage(updatedList);
      })
    );

    // Signals
    this.tasks.update((tasks) => {
      const updatedList = [...tasks];
      updatedList[index] = newTask;
      return updatedList;
    });
  }

  updateTask(index: number) {
    this.tasks.update(prevState => {
      return prevState.map((task, position) => {
        if (position === index) {
          return {
            ...task,
            isCompleted: !task.isCompleted
          }
        }
        return task;
      })
    });
  }

  updateTaskEditingMode(index: number) {
    this.tasks.update(prevState => {
      return prevState.map((task, position) => {
        if (position === index) {
          return {
            ...task,
            editing: true
          }
        }
        return {
          ...task,
          editing: false
        };
      })
    });
  }

  updateTaskText(index: number, event: Event) {
    const input = event.target as HTMLInputElement;
    this.tasks.update(prevState => {
      return prevState.map((task, position) => {
        if (position === index) {
          return {
            ...task,
            title: input.value,
            editing: false
          }
        }
        return task;
      })
    });
  }

  onChangeTaskStatus(index: number) {
    this.taskObservable$
      .pipe(
        take(1),
        map((tasks) => {
          return tasks.map((task, position) => {
            if (position === index) {
              return {
                ...task,
                isCompleted: !task.isCompleted,
              };
            } else {
              return task;
            }
          });
        })
      )
      .subscribe((updatedTasks) => {
        this.taskObservable$ = of(updatedTasks);
        this.updateLocalStorage(updatedTasks);
      });

    // Signals

    this.tasks.update((task) => {
      return task.map((task, position) => {
        if (position === index) {
          return {
            ...task,
            isCompleted: !task.isCompleted,
          };
        } else {
          return task;
        }
      });
    });
  }

  onClearCompleted() {
    // this.taskObservable$
    //   .pipe(
    //     take(1),
    //     map((tasks) => tasks.filter((task) => !task.isCompleted))
    //   )
    //   .subscribe((updatedTasks) => {
    //     this.taskObservable$ = of(updatedTasks);
    //     this.updateLocalStorage(updatedTasks);
    //   });

    // // Signals

    this.tasks.update((tasks) => tasks.filter((task) => !task.isCompleted));
  }

  private updateLocalStorage(updatedList: Task[]) {
    localStorage.setItem('tasks', JSON.stringify(updatedList));
  }

  filterTasks(filter: string) {
    this.filter.set(filter);
  }
}
