import { Component, Input, OnChanges, SimpleChange, SimpleChanges } from '@angular/core'
import { async, ComponentFixture, TestBed } from '@angular/core/testing'
import { FormsModule, ReactiveFormsModule } from '@angular/forms'
import { By } from '@angular/platform-browser'
import { BehaviorSubject } from 'rxjs'


@Component({
  template: `
    <div>
      <ul>
        <li>{{key1}}</li>
        <li>
          <ul>
            <li *ngFor="let x of key2">{{x}}</li>
          </ul>
        </li>
        <li>{{key3 | json}}</li>
      </ul>
    </div>
  `,
  selector: 'test-change-consumer'
})
class ChangeConsumerComponent implements OnChanges {

  @Input() key1: string
  @Input() key2: string[]
  @Input() key3: any

  changes = new BehaviorSubject<SimpleChanges>({})

  ngOnChanges(changes) {
    this.changes.next(changes)
  }
}

@Component({
  template: `<test-change-consumer #target [key1]="state.key1" [key2]="state.key2" [key3]="state.key3"></test-change-consumer>`
})
class TestHostComponent {

  state: {
    key1: string
    key2: string[]
    key3: any
  }

  constructor() {
    this.state = {
      key1: null,
      key2: [],
      key3: {}
    }
  }
}

describe('change detection', () => {

  let fixture: ComponentFixture<TestHostComponent>
  let host: TestHostComponent
  let target: ChangeConsumerComponent

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      providers: [],
      imports: [
        FormsModule,
        ReactiveFormsModule,
      ],
      declarations: [
        ChangeConsumerComponent,
        TestHostComponent
      ]
    })
    .compileComponents()
  }))

  let changes: SimpleChanges[]

  beforeEach(() => {
    fixture = TestBed.createComponent(TestHostComponent)
    host = fixture.componentInstance
    target = fixture.debugElement.query(By.directive(ChangeConsumerComponent)).references.target
    fixture.detectChanges()
    changes = []
    target.changes.subscribe(x => {
      changes.push(x)
    })
  })

  it('should create', () => {
    expect(target).toBeTruthy()
  })

  it('detects changes', () => {

    host.state = { ...host.state, key1: 'abc' }
    fixture.detectChanges()
    host.state = { ...host.state, key1: 'abc' }
    fixture.detectChanges()
    host.state = { ...host.state, key1: 'def' }
    fixture.detectChanges()

    expect(changes).toEqual([
      {
        key1: new SimpleChange(undefined, null, true),
        key2: new SimpleChange(undefined, [], true),
        key3: new SimpleChange(undefined, {}, true)
      },
      {
        key1: new SimpleChange(null, 'abc', false)
      },
      {
        key1: new SimpleChange('abc', 'def', false)
      }
    ])
  })
})
