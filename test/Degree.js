import _ from 'lodash'
import Degree from '../src/Degree'

const chai = require('chai')
chai.use( require('chai-subset') )
chai.should()

describe('Degree', function() {

  describe('Input / Output', function() {

    it('parses degree strings', function() {
      let tests = [
        ["1" ,1,null],
        ["12",12,null],
        ["7" ,7,null],
        ["b2",2, "b"],
        ["#5",5, "#"],
        ["b11",11,"b"],
        ["bb10",10,"bb"],
        ["##12",12,"##"],
        ["bb4",4,"bb"],
        ["##1",1,"##"],
        ["*3",3,"*"]]

      _.map( tests,
             function( x ) {
               let degree = Degree.fromString( x[0] )
               degree.should.have.property('raw', x[0])
               degree.should.have.property('interval', x[1])
               degree.should.have.property('modifier', x[2])
             }
      )
    })

    it('parses degree lists', function() {
      let degreeList = "(b1)"
      Degree.fromListString( degreeList ).should.containSubset(
          {
            raw: '(b1)',
            degrees: [{ raw: 'b1', interval: 1, modifier: 'b'}]
          }
      );

      degreeList = "(*b3,2,12,bb10)"
      Degree.fromListString( degreeList ).should.containSubset(
          { 
            raw: '(*b3,2,12,bb10)',
            degrees: [
               { raw: '*b3', interval: 3,  modifier: '*b' },
               { raw: '2',   interval: 2,  modifier: null },
               { raw: '12',  interval: 12, modifier: null },
               { raw: 'bb10',  interval: 10, modifier: 'bb' }]
          }
      );
      
      degreeList = "b1"
      Degree.fromListString( degreeList ).should.containSubset(
          {
            raw: 'b1',
            degrees: [{ raw: 'b1', interval: 1, modifier: 'b'}]
          }
      );

      degreeList = "*b3,2,12,bb10"
      Degree.fromListString( degreeList ).should.containSubset(
          { 
            raw: '*b3,2,12,bb10',
            degrees: [
               { raw: '*b3', interval: 3,  modifier: '*b' },
               { raw: '2',   interval: 2,  modifier: null },
               { raw: '12',  interval: 12, modifier: null },
               { raw: 'bb10',  interval: 10, modifier: 'bb' }]
          }
      );

    })

    it ('writes degree strings', function() {
      let tests = [
        ["1" ,1,null],
        ["12",12,null],
        ["7" ,7,null],
        ["b2",2, "b"],
        ["#5",5, "#"],
        ["b11",11,"b"],
        ["bb10",10,"bb"],
        ["##12",12,"##"],
        ["bb4",4,"bb"],
        ["##1",1,"##"],
        ["*3",3,"*"]]

      _.map( tests,
             function( x ) {
               let degree = Degree.fromString( x[0] )
               degree.toString().should.equal( x[0] )
             }
      )

    })

    it ('writes degree lists', function() {
      let degrees = []
      Degree.toListString( degrees ).should.equal('')

      degrees = [ Degree.fromString('b1') ]
      Degree.toListString( degrees ).should.equal('(b1)')

      degrees = [ Degree.fromString('*b3'),
                  Degree.fromString('2'),
                  Degree.fromString('12'),
                  Degree.fromString('bb10') ]

      Degree.toListString( degrees )
        .should.equal('(*b3,2,12,bb10)')
    })
  })
})
