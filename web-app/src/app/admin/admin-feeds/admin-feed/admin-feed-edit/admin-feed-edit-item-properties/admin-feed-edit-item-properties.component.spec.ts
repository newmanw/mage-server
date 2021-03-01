import { JsonSchemaFormModule } from '@ajsf/core';
import { Component, ViewChild } from '@angular/core';
import { async, ComponentFixture, fakeAsync, TestBed, tick } from '@angular/core/testing';
import { FormArray, FormGroup, FormsModule, ReactiveFormsModule } from '@angular/forms'
import {
  MatCardModule,
  MatDividerModule,
  MatExpansionModule,
  MatFormFieldModule,
  MatInputModule
} from '@angular/material';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { JsonSchemaModule } from 'src/app/json-schema/json-schema.module';
import { AdminFeedEditItemPropertiesComponent, KeyedPropertySchema, SchemaFormValue, SimpleJsonSchema, SimplePropertyJsonSchema } from './admin-feed-edit-item-properties.component';

describe('AdminFeedEditItemPropertiesComponent', () => {
  @Component({
    selector: 'app-host-component',
    template: `
      <app-feed-item-properties-configuration
        [topicSchema]="topicSchema"
        [feedSchema]="feedSchema"
        [expanded]="expanded"
      >
      </app-feed-item-properties-configuration>
    `
  })
  class TestHostComponent {
    topicSchema: SimpleJsonSchema = null
    feedSchema: SimpleJsonSchema = null
    expanded: boolean

    @ViewChild(AdminFeedEditItemPropertiesComponent, { static: true })
    public target: AdminFeedEditItemPropertiesComponent
  }

  let host: TestHostComponent;
  let target: AdminFeedEditItemPropertiesComponent;
  let fixture: ComponentFixture<TestHostComponent>;

  const feedItemPropertiesSchema = {
    type: 'object',
    properties: {
      newProperty: {
        title: 'New Property',
        type: 'string'
      },
      date: {
        title: 'Date It Happened',
        type: 'string',
        format: 'date-time'
      },
      reference: { title: 'Reference Number', type: 'string' },
      subreg: { title: 'Geographical Subregion', type: 'number' },
      description: { title: 'Description', type: 'string' },
      hostilityVictim: { title: 'Aggressor-Victim', type: 'string' },
      hostility: { title: 'Agressor', type: 'string' },
      victim: { title: 'Victim', type: 'string' },
      navArea: { title: 'Navigation Area', type: 'string' },
      position: {
        title: 'Position',
        type: 'string',
      },
      timestamp: {
        title: 'Date Of Occurrence',
        type: 'number',
        format: 'date-time'
      }
    }
  } as SimpleJsonSchema

  const topicSchema = {
    type: 'object',
    properties: {
      date: {
        title: 'Date Of Occurrence',
        type: 'string',
        format: 'date-time',
        pattern: 'dddd-dd-dd'
      },
      reference: { title: 'Reference Number', type: 'string' },
      subreg: { title: 'Geographical Subregion', type: 'number' },
      description: { title: 'Description', type: 'string' },
      hostilityVictim: { title: 'Aggressor-Victim', type: 'string' },
      hostility: { title: 'Agressor', type: 'string' },
      victim: { title: 'Victim', type: 'string' },
      navArea: { title: 'Navigation Area', type: 'string' },
      position: {
        title: 'Position',
        type: 'string',
      },
      timestamp: {
        title: 'Date Of Occurrence',
        type: 'number',
      }
    }
  } as SimpleJsonSchema;

  const topic = {
    id: 'asam',
    title: 'ASAMs',
    summary: 'summary',
    paramsSchema: {
      type: 'object',
      properties: {
        newerThanDays: {
          type: 'number',
          default: 56
        }
      }
    },
    itemsHaveIdentity: true,
    itemsHaveSpatialDimension: true,
    itemPrimaryProperty: 'description',
    itemSecondaryProperty: 'hostilityVictim',
    itemTemporalProperty: 'timestamp',
    updateFrequencySeconds: 915,
    mapStyle: {
      iconUrl: 'https://mage-msi.geointservices.io/icons/asam.png'
    },
    itemPropertiesSchema: topicSchema
  };

  let tickPastDebounce: () => void

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      imports: [
        FormsModule,
        ReactiveFormsModule,
        MatCardModule,
        MatDividerModule,
        MatExpansionModule,
        MatFormFieldModule,
        MatInputModule,
        JsonSchemaFormModule,
        JsonSchemaModule,
        NoopAnimationsModule,
      ],
      declarations: [
        TestHostComponent,
        AdminFeedEditItemPropertiesComponent
      ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(TestHostComponent);
    host = fixture.componentInstance;
    target = host.target;
    fixture.detectChanges()
    tickPastDebounce = () => {
      jasmine.clock().tick(target.changeDebounceInterval + 50)
    }
  });

  it('should create', () => {
    expect(target).toBeTruthy();
  });

  describe('changing topic and feed schemas', () => {

    let formChanges: SchemaFormValue[]
    let schemaChanges: SimpleJsonSchema[]

    beforeEach(() => {
      jasmine.clock().install()
      formChanges = []
      schemaChanges = []
      target.schemaForm.valueChanges.subscribe(x => {
        formChanges.push(x)
      })
      target.feedSchemaChanged.subscribe(x => {
        schemaChanges.push(x)
      })
    })

    afterEach(() => {
      jasmine.clock().uninstall()
    })

    describe('updating the schema form', () => {

      afterEach(() => {
        // ensure no schema changes are emitted while syncing form to input schema changes
        tickPastDebounce()
        expect(schemaChanges).toEqual([])
      })

      it('builds a new schema form from topic schema when feed schema is null', () => {

        const formBefore = target.schemaForm
        host.topicSchema = {
          properties: {
            prop1: {
              type: 'string',
              title: 'Prop 1'
            },
            prop2: {
              type: 'boolean',
              title: 'Prop 2'
            }
          }
        }
        host.feedSchema = null
        fixture.detectChanges()

        expect(target.schemaForm).toBe(formBefore)
        expect(target.schemaForm.length).toEqual(2)
        expect(target.schemaForm.value).toEqual(formValueForSchema(host.topicSchema))
      })

      it('builds a new schema form from the feed schema when topic and feed schemas are not null', () => {

        const formBefore = target.schemaForm
        host.topicSchema = {
          properties: {
            prop1: {
              type: 'string',
              title: 'Prop 1'
            },
            prop2: {
              type: 'boolean',
              title: 'Prop 2'
            }
          }
        }
        host.feedSchema = {
          properties: {
            prop1Mod: {
              type: 'string',
              title: 'Prop 1 Mod'
            }
          }
        }
        fixture.detectChanges()

        expect(target.schemaForm).toBe(formBefore)
        expect(target.schemaForm.length).toEqual(1)
        expect(target.schemaForm.value).toEqual([
          {
            key: 'prop1Mod',
            schema: {
              type: 'string',
              title: 'Prop 1 Mod',
              description: null,
              format: null
            }
          }
        ])
      })

      it('builds a new schema form when the topic schema changes with like properties', () => {

        host.topicSchema = {
          properties: {
            prop1: {
              type: 'string',
              title: 'Prop 1'
            },
            prop2: {
              type: 'boolean',
              title: 'Prop 2'
            }
          }
        }
        fixture.detectChanges()

        const formBefore = target.schemaForm
        const controlsBefore = [ ...formBefore.controls ]
        expect(target.schemaForm.value).toEqual(formValueForSchema(host.topicSchema))

        host.topicSchema = {
          properties: {
            prop1: {
              type: 'number',
              description: 'replace topic'
            },
            prop2: {
              type: 'number',
              description: 'replace topic'
            }
          }
        }
        fixture.detectChanges()

        const controlsAfter = [ ...target.schemaForm.controls ]

        expect(target.schemaForm).toBe(formBefore)
        expect(target.schemaForm.value).toEqual(formValueForSchema(host.topicSchema))
        expect(controlsBefore.length).toEqual(2)
        expect(controlsAfter.length).toEqual(2)
        let count = controlsBefore.length
        while (count--) {
          expect(controlsAfter[count].get('key').value).toEqual(controlsBefore[count].get('key').value)
          expect(controlsAfter).not.toContain(controlsBefore[count], `same form control for key ${controlsAfter[count].get('key').value}`)
        }
      })

      it('builds a new schema form when replacing topic schema with form schema', () => {

        host.topicSchema = {
          properties: {
            prop1: {
              type: 'string',
              title: 'Prop 1'
            },
            prop2: {
              type: 'boolean',
              title: 'Prop 2'
            }
          }
        }
        fixture.detectChanges()

        expect(target.feedSchema).toBeNull()
        expect(target.topicSchema).toEqual(host.topicSchema)
        expect(target.schemaForm.value).toEqual(formValueForSchema(host.topicSchema))

        const formBefore = target.schemaForm
        const beforeControls = [ ...formBefore.controls ]

        host.feedSchema = {
          properties: {
            prop1: {
              type: 'number',
              title: 'Prop 1 Mod'
            },
            prop2: {
              type: 'number',
              title: 'Prop 2 Mod'
            }
          }
        }
        fixture.detectChanges()

        const afterControls = [ ...target.schemaForm.controls ]

        expect(formBefore).toBe(target.schemaForm)
        expect(beforeControls.length).toEqual(2)
        expect(afterControls.length).toEqual(2)
        let count = beforeControls.length
        while (count--) {
          expect(afterControls[count].get('key').value).toEqual(beforeControls[count].get('key').value)
          expect(afterControls).not.toContain(beforeControls[count], `same form control for key ${afterControls[count].get('key').value}`)
        }
        expect(target.schemaForm.value).toEqual(formValueForSchema(host.feedSchema))
      })

      it('builds a new schema form from topic schema when feed schema changes to null and topic schema does not change', () => {

        host.topicSchema = {
          properties: {
            prop1: {
              type: 'string',
              title: 'Durable',
              description: 'Returns eventually'
            }
          }
        }
        host.feedSchema = {
          properties: {
            prop1: {
              type: 'string',
              title: 'Fleeting',
              description: 'Going away'
            }
          }
        }
        fixture.detectChanges()

        const formBefore = target.schemaForm
        const beforeControls = [ ...formBefore.controls ]
        expect(target.schemaForm.value).toEqual(formValueForSchema(host.feedSchema))

        host.feedSchema = null
        fixture.detectChanges()

        const afterControls = [ ...target.schemaForm.controls ]
        expect(target.schemaForm.value).toEqual(formValueForSchema(host.topicSchema))

        expect(formBefore).toBe(target.schemaForm)
        expect(beforeControls.length).toEqual(1)
        expect(afterControls.length).toEqual(1)
        expect(afterControls[0]).not.toBe(beforeControls[0])
      })

      it('builds a new schema form when topic schema changes and feed schema changes to null', () => {

        host.topicSchema = {
          properties: {
            prop1: { type: 'string', title: 'Topic 1 Prop 1' }
          }
        }
        host.feedSchema = {
          properties: {
            prop1: { type: 'string', title: 'Feed 1 Prop 1' }
          }
        }
        fixture.detectChanges()

        const formBefore = target.schemaForm
        const beforeControls = [ ...formBefore.controls ]

        expect(target.schemaForm.value).toEqual(formValueForSchema(host.feedSchema))

        host.topicSchema = {
          properties: {
            prop1: { type: 'string', title: 'Topic 2 Prop 1' }
          }
        }
        host.feedSchema = null
        fixture.detectChanges()
        const afterControls = [ ...target.schemaForm.controls ]

        expect(target.schemaForm).toBe(formBefore)
        expect(beforeControls.length).toEqual(1)
        expect(afterControls.length).toEqual(1)
        expect(beforeControls[0]).not.toBe(afterControls[0])
      })

      it('does not change the form when the topic schema changes and feed schema does not change', () => {

        host.topicSchema = {
          properties: {
            prop1: {
              type: 'string',
              title: 'Prop 1'
            },
            prop2: {
              type: 'boolean',
              title: 'Prop 2'
            }
          }
        }
        host.feedSchema = {
          properties: {
            prop1: {
              type: 'string',
              title: 'Prop 1 Mod'
            }
          }
        }
        fixture.detectChanges()

        const formBefore = target.schemaForm
        const controlsBefore = [ ...formBefore.controls ]
        const valueBefore = formBefore.value as SchemaFormValue

        host.topicSchema = {
          properties: {
            prop1: {
              title: 'Topic Schema Changed',
              type: 'number'
            }
          }
        }
        fixture.detectChanges()

        const controlsAfter = [ ...target.schemaForm.controls ]
        const valueAfter = target.schemaForm.value as SchemaFormValue

        expect(target.schemaForm).toBe(formBefore)
        expect(controlsBefore.length).toEqual(1)
        expect(controlsAfter.length).toEqual(1)
        expect(controlsBefore[0]).toBe(controlsAfter[0])
        expect(valueAfter).toEqual(valueBefore)
        expect(valueBefore).toEqual([
          {
            key: 'prop1',
            schema: {
              type: 'string',
              title: 'Prop 1 Mod',
              description: null,
              format: null
            }
          }
        ])
      })

      it('updates the existing form when feed schema changes and topic does not change', () => {

        host.topicSchema = {
          properties: {
            prop1: {
              type: 'string',
              title: 'Prop 1 Topic'
            }
          }
        }
        const schemaBefore = host.feedSchema = {
          properties: {
            prop1: {
              type: 'string',
              title: 'Prop 1 Feed'
            }
          }
        }
        fixture.detectChanges()

        const formBefore = target.schemaForm
        const controlsBefore = [ ...formBefore.controls ]
        const valueBefore = formBefore.value as SchemaFormValue

        expect(target.schemaForm.value).toEqual(formValueForSchema(schemaBefore))

        host.feedSchema = {
          properties: {
            prop1: {
              type: 'string',
              title: 'Prop 1 Feed Mod'
            },
            prop2: {
              type: 'string',
              title: 'Added Property'
            }
          }
        }
        fixture.detectChanges()

        const controlsAfter = [ ...target.schemaForm.controls ]

        expect(target.schemaForm).toBe(formBefore)
        expect(controlsBefore.length).toEqual(1)
        expect(controlsAfter.length).toEqual(2)
        expect(controlsBefore[0]).toBe(controlsAfter[0])
        expect(target.schemaForm.value).not.toEqual(valueBefore)
        expect(target.schemaForm.value).toEqual(formValueForSchema(host.feedSchema))
      })
    })

    describe('emitting schema changes', () => {

      let schemaChanges: SimpleJsonSchema[]

      beforeEach(() => {
        schemaChanges = []
        target.feedSchemaChanged.subscribe(x => {
          schemaChanges.push(x)
        })
      })

      it('emits debounced changes when form values change ', () => {

        host.topicSchema = {
          properties: {
            prop1: {
              type: 'string',
              title: 'Prop 1'
            }
          }
        }
        fixture.detectChanges()
        tickPastDebounce()

        expect(schemaChanges).toEqual([])

        target.schemaForm.get([0, 'schema', 'title']).setValue('Prop 1 M')
        target.schemaForm.get([0, 'schema', 'title']).setValue('Prop 1 Mod')

        const expectedFormChanges: SchemaFormValue[] = [
          formValueForSchema(host.topicSchema),
          formValueForSchema({
            properties: {
              prop1: { type: 'string', title: 'Prop 1 M' }
            }
          }),
          formValueForSchema({
            properties: {
              prop1: { type: 'string', title: 'Prop 1 Mod' }
            }
          })
        ]
        expect(formChanges).toEqual(expectedFormChanges)

        tickPastDebounce()

        expect(schemaChanges).toEqual([
          {
            properties: {
              prop1: { type: 'string', title: 'Prop 1 Mod' }
            }
          }
        ])
      })

      it('does not emit a change when populating the form from the topic schema', () => {

        host.topicSchema = {
          properties: {
            prop1: {
              type: 'string',
              title: 'Prop 1'
            }
          }
        }
        fixture.detectChanges()
        tickPastDebounce()

        expect(target.schemaForm.value).toEqual(formValueForSchema(host.topicSchema))
        expect(schemaChanges).toEqual([])
      })

      it('does not emit a change when populating the form from the feed schema', () => {

        host.feedSchema = {
          properties: {
            prop1: {
              type: 'string',
              title: 'Prop 1'
            }
          }
        }
        fixture.detectChanges()
        tickPastDebounce()

        expect(target.schemaForm.value).toEqual(formValueForSchema(host.feedSchema))
        expect(schemaChanges).toEqual([])
      })

      it('does not emit a change when topic and feed schemas change', () => {

        host.topicSchema = {
          properties: {
            prop1: {
              type: 'string',
              title: 'From Topic'
            }
          }
        }
        host.feedSchema = {
          properties: {
            prop1: {
              type: 'string',
              title: 'From Feed'
            }
          }
        }
        fixture.detectChanges()
        tickPastDebounce()

        expect(target.schemaForm.value).toEqual(formValueForSchema(host.feedSchema))
        expect(schemaChanges).toEqual([])
      })

      it('does not emit a change when populating from feed schema after feed schema changes', () => {

        host.topicSchema = {
          properties: {
            prop1: {
              type: 'string',
              title: 'From Topic'
            }
          }
        }
        fixture.detectChanges()
        tickPastDebounce()

        expect(target.schemaForm.value).toEqual(formValueForSchema(host.topicSchema))

        host.feedSchema = {
          properties: {
            prop1: {
              type: 'string',
              title: 'From Feed'
            }
          }
        }
        fixture.detectChanges()
        tickPastDebounce()

        expect(target.schemaForm.value).toEqual(formValueForSchema(host.feedSchema))
        expect(schemaChanges).toEqual([])
      })

      it('does not emit a change when populating from topic schema after feed schema changes to null', () => {

        host.topicSchema = {
          properties: {
            prop1: {
              type: 'string',
              title: 'From Topic'
            }
          }
        }
        host.feedSchema = {
          properties: {
            prop1: {
              type: 'string',
              title: 'From Feed'
            }
          }
        }
        fixture.detectChanges()
        tickPastDebounce()

        expect(target.schemaForm.value).toEqual(formValueForSchema(host.feedSchema))

        host.feedSchema = null
        fixture.detectChanges()
        tickPastDebounce()

        expect(target.schemaForm.value).toEqual(formValueForSchema(host.topicSchema))
        expect(schemaChanges).toEqual([])
      })
    })
  })
});

function formValueForSchema(schema: SimpleJsonSchema): SchemaFormValue {
  if (!schema || !schema.properties) {
    return []
  }
  return Object.getOwnPropertyNames(schema.properties).sort().map(key => {
    return {
      key,
      schema: {
        title: null,
        description: null,
        format: null,
        ...schema.properties[key]
      }
    }
  })
}

describe('formValueForSchema test function', () => {

  it('returns empty array for absent schema', () => {
    expect(formValueForSchema(null)).toEqual([])
    expect(formValueForSchema(undefined)).toEqual([])
  })

  it('returns empty array for absent schema properties', () => {
    expect(formValueForSchema({})).toEqual([])
    expect(formValueForSchema({ properties: null })).toEqual([])
    expect(formValueForSchema({ properties: {} })).toEqual([])
  })

  it('returns a sorted array of keyed property schemas for the schema properties', () => {

    const schema: SimpleJsonSchema = {
      properties: {
        prop2: {
          type: 'boolean'
        },
        prop3: {
          type: 'number',
          format: 'date-time'
        },
        prop1: {
          type: 'string',
          title: 'Prop 1',
          description: 'the first property',
          format: 'date-time'
        },
      }
    }
    const expectedFormValue: SchemaFormValue = [
      {
        key: 'prop1',
        schema: {
          type: 'string',
          title: schema.properties.prop1.title,
          description: 'the first property',
          format: 'date-time'
        }
      },
      {
        key: 'prop2',
        schema: {
          type: 'boolean',
          title: null,
          description: null,
          format: null
        }
      },
      {
        key: 'prop3',
        schema: {
          type: 'number',
          title: null,
          description: null,
          format: 'date-time'
        }
      }
    ]
    expect(formValueForSchema(schema)).toEqual(expectedFormValue)
  })
})
